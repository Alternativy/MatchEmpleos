-- Match Empleos: respuestas que llegan al postulante, estado "Vista", plazo por búsqueda,
-- reputación calculada en el servidor, regla de publicación y baja de cuenta.
-- Idempotente: se puede correr más de una vez. Aplicar primero en staging y después en producción.

begin;

-- ---------------------------------------------------------------------------
-- 1. Columnas nuevas
-- ---------------------------------------------------------------------------

-- Plazo de respuesta comprometido al publicar (3, 5 o 7 días)
alter table public.busquedas add column if not exists plazo integer not null default 3;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'busquedas_plazo_check') then
    alter table public.busquedas add constraint busquedas_plazo_check check (plazo in (3, 5, 7));
  end if;
end $$;
update public.busquedas b
   set plazo = p.plazo
  from public.perfiles p
 where p.id = b.empresa_id and p.plazo in (3, 5, 7) and b.plazo = 3;

-- Cuándo la vio y cuándo la respondió la empresa
alter table public.postulaciones add column if not exists vista_at timestamptz;
alter table public.postulaciones add column if not exists respondida_at timestamptz;

-- Un chat puede nacer de un match ("Lo quiero conocer") o de una consulta ("Quiero saber un poco más")
alter table public.chats add column if not exists match boolean not null default true;

-- ---------------------------------------------------------------------------
-- 2. Datos existentes: las respuestas ya dadas pasan a "Respondida"
-- ---------------------------------------------------------------------------
update public.postulaciones p
   set respondida_at = coalesce(p.respondida_at, ce.updated_at, now()),
       estado = 'Respondida',
       datos = jsonb_set(
         coalesce(p.datos, '{}'::jsonb), '{respuesta}',
         coalesce(p.datos -> 'respuesta', jsonb_build_object('tipo', ce.estado, 'texto', null, 'fecha', ce.updated_at)))
  from public.candidatos_estado ce
 where ce.id = p.id and (p.respondida_at is null or p.estado <> 'Respondida');

update public.chats c
   set match = (ce.estado = 'si')
  from public.candidatos_estado ce
 where ce.id = c.postulacion_id;

-- ---------------------------------------------------------------------------
-- 3. Reputación: tasa = respondidas a tiempo / (respondidas + vencidas sin responder)
--    Se calcula al leer, porque una postulación vence sola con el paso del tiempo.
-- ---------------------------------------------------------------------------
create or replace function public.reputacion_empresas(p_ids uuid[])
returns table (empresa_id uuid, tasa integer, demora numeric, evaluadas integer, pendientes integer)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select b.empresa_id,
           p.created_at,
           p.respondida_at,
           p.created_at + make_interval(days => b.plazo) as vence
      from public.postulaciones p
      join public.busquedas b on b.id = p.oferta_id
     where b.empresa_id = any (p_ids)
  ), agg as (
    select empresa_id,
           count(*) filter (where respondida_at is not null and respondida_at <= vence) as a_tiempo,
           count(*) filter (where respondida_at is not null or vence < now()) as evaluadas,
           count(*) filter (where respondida_at is null) as pendientes,
           avg(extract(epoch from (respondida_at - created_at)) / 86400.0)
             filter (where respondida_at is not null) as demora
      from base
     group by empresa_id
  )
  select e.id as empresa_id,
         case when coalesce(a.evaluadas, 0) > 0 then round(100.0 * a.a_tiempo / a.evaluadas)::integer end as tasa,
         round(a.demora::numeric, 1) as demora,
         coalesce(a.evaluadas, 0)::integer as evaluadas,
         coalesce(a.pendientes, 0)::integer as pendientes
    from unnest(p_ids) as e(id)
    left join agg a on a.empresa_id = e.id;
$$;
revoke all on function public.reputacion_empresas(uuid[]) from public, anon;
grant execute on function public.reputacion_empresas(uuid[]) to authenticated;

-- La copia guardada en perfiles usa la misma fórmula (se actualiza en cada evento)
create or replace function public.recalcular_tasa(p_empresa uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  if p_empresa is null then return; end if;
  select * into r from public.reputacion_empresas(array[p_empresa]);
  update public.perfiles
     set tasa = r.tasa,
         demora = case when r.demora is null then null else ceil(r.demora)::integer end
   where id = p_empresa;
end $$;

drop trigger if exists tasa_postulaciones on public.postulaciones;
create trigger tasa_postulaciones
  after insert or delete or update of respondida_at on public.postulaciones
  for each row execute function public.trg_recalcular_tasa();

-- ---------------------------------------------------------------------------
-- 4. Responder: guarda la respuesta, la marca como respondida y abre el chat
--    para "si" (match) y "mas" (consulta). Todo en una sola operación.
-- ---------------------------------------------------------------------------
create or replace function public.responder_postulacion(p_id text, p_tipo text, p_texto text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_emp uuid;
  v_cand uuid;
  v_nombre text;
  v_texto text := nullif(btrim(coalesce(p_texto, '')), '');
begin
  select b.empresa_id, p.candidato_id into v_emp, v_cand
    from public.postulaciones p
    join public.busquedas b on b.id = p.oferta_id
   where p.id = p_id;
  if v_emp is null or v_emp <> auth.uid() then raise exception 'no_autorizado'; end if;
  if p_tipo not in ('si', 'no', 'mas') then raise exception 'tipo_invalido'; end if;
  if v_texto is null then raise exception 'texto_vacio'; end if;
  if char_length(v_texto) > 2000 then raise exception 'texto_largo'; end if;

  select nombre into v_nombre from public.perfiles where id = v_cand;

  insert into public.candidatos_estado (id, empresa_id, corto, estado, updated_at)
  values (p_id, v_emp, coalesce(nullif(btrim(v_nombre), ''), 'Postulante'), p_tipo, now())
  on conflict (id) do update set estado = excluded.estado, updated_at = now();

  update public.postulaciones
     set estado = 'Respondida',
         respondida_at = coalesce(respondida_at, now()),
         updated_at = now(),
         datos = jsonb_set(
           jsonb_set(coalesce(datos, '{}'::jsonb), '{respuesta}',
             jsonb_build_object('tipo', p_tipo, 'texto', v_texto, 'fecha', now())),
           '{post,estado}', '"Respondida"', true)
   where id = p_id;

  if p_tipo in ('si', 'mas') then
    insert into public.chats (id, postulacion_id, candidato_id, empresa_id, match)
    values (p_id, p_id, v_cand, v_emp, p_tipo = 'si')
    on conflict (id) do update set match = public.chats.match or excluded.match;
    insert into public.mensajes (chat_id, autor_id, texto, h)
    values (p_id, v_emp, v_texto, to_char(now() at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI'));
  end if;
end $$;
revoke all on function public.responder_postulacion(text, text, text) from public, anon;
grant execute on function public.responder_postulacion(text, text, text) to authenticated;

-- El trigger anterior abría el chat solo para "si"; ahora también marca si es match
create or replace function public.abrir_chat_con_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado in ('si', 'mas') then
    insert into public.chats (id, postulacion_id, candidato_id, empresa_id, match)
    select p.id, p.id, p.candidato_id, b.empresa_id, new.estado = 'si'
      from public.postulaciones p
      join public.busquedas b on b.id = p.oferta_id
     where p.id = new.id and b.empresa_id = new.empresa_id
    on conflict (id) do update set match = public.chats.match or excluded.match;
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 5. "Te vieron": la empresa abre el perfil y la postulación pasa a Vista
-- ---------------------------------------------------------------------------
create or replace function public.marcar_vista(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.postulaciones p
     set estado = 'Vista',
         vista_at = coalesce(p.vista_at, now()),
         updated_at = now(),
         datos = jsonb_set(coalesce(p.datos, '{}'::jsonb), '{post,estado}', '"Vista"', true)
    from public.busquedas b
   where p.id = p_id and b.id = p.oferta_id and b.empresa_id = auth.uid() and p.estado = 'Enviada';
end $$;
revoke all on function public.marcar_vista(text) from public, anon;
grant execute on function public.marcar_vista(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Regla central en el servidor: no se publica con postulaciones sin responder
-- ---------------------------------------------------------------------------
create or replace function public.trg_bloquear_publicacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Un upsert de una búsqueda existente (editar) también pasa por acá: se permite
  if exists (select 1 from public.busquedas where id = new.id) then return new; end if;
  if exists (
    select 1
      from public.postulaciones p
      join public.busquedas b on b.id = p.oferta_id
     where b.empresa_id = new.empresa_id and p.respondida_at is null
  ) then
    raise exception 'pendientes_sin_responder';
  end if;
  return new;
end $$;
revoke all on function public.trg_bloquear_publicacion() from public, anon, authenticated;
drop trigger if exists bloquear_publicacion on public.busquedas;
create trigger bloquear_publicacion
  before insert on public.busquedas
  for each row execute function public.trg_bloquear_publicacion();

-- ---------------------------------------------------------------------------
-- 7. Las postulaciones solo cambian por funciones del servidor
--    (antes el postulante podía marcar la suya como "Respondida" desde el navegador)
-- ---------------------------------------------------------------------------
drop policy if exists "candidato gestiona sus postulaciones" on public.postulaciones;
drop policy if exists "candidato lee sus postulaciones" on public.postulaciones;
create policy "candidato lee sus postulaciones" on public.postulaciones
  for select to authenticated using (candidato_id = (select auth.uid()));
drop policy if exists "empresa actualiza postulaciones de sus busquedas" on public.postulaciones;
revoke update on public.postulaciones from authenticated;

-- ---------------------------------------------------------------------------
-- 8. Baja de cuenta (lo prometen Privacidad, Términos y Ayuda)
-- ---------------------------------------------------------------------------
-- Las denuncias quedan para moderación aunque se borre quien participó
alter table public.denuncias alter column empresa_id drop not null;
alter table public.denuncias alter column denunciante_id drop not null;
alter table public.denuncias alter column postulacion_id drop not null;
alter table public.denuncias drop constraint if exists denuncias_empresa_id_fkey;
alter table public.denuncias add constraint denuncias_empresa_id_fkey
  foreign key (empresa_id) references public.perfiles(id) on delete set null;
alter table public.denuncias drop constraint if exists denuncias_denunciante_id_fkey;
alter table public.denuncias add constraint denuncias_denunciante_id_fkey
  foreign key (denunciante_id) references public.perfiles(id) on delete set null;
alter table public.denuncias drop constraint if exists denuncias_postulacion_id_fkey;
alter table public.denuncias add constraint denuncias_postulacion_id_fkey
  foreign key (postulacion_id) references public.postulaciones(id) on delete set null;

create or replace function public.eliminar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v uuid := auth.uid();
begin
  if v is null then raise exception 'no_autenticado'; end if;
  delete from public.mensajes where autor_id = v;
  -- Empresa: sus búsquedas, las postulaciones que recibió y sus respuestas
  delete from public.candidatos_estado where empresa_id = v;
  delete from public.postulaciones where oferta_id in (select id from public.busquedas where empresa_id = v);
  -- Postulante: sus postulaciones y las respuestas que recibió
  delete from public.candidatos_estado where id in (select id from public.postulaciones where candidato_id = v);
  delete from public.postulaciones where candidato_id = v;
  -- perfiles, búsquedas, chats y mensajes restantes se borran en cascada
  delete from auth.users where id = v;
end $$;
revoke all on function public.eliminar_mi_cuenta() from public, anon;
grant execute on function public.eliminar_mi_cuenta() to authenticated;

commit;
