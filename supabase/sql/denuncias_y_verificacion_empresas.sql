-- Denuncias de empresas y verificación manual por el equipo de Match Empleos.
-- Alineado con el esquema y las políticas verificadas en Supabase producción
-- (mijmzywmrazzaqypuwhu, 2026-11-12).
--
-- Este archivo es un script idempotente de referencia para este modelo de producción.
-- Staging todavía conserva una política INSERT anterior para denuncias; comparar
-- ambos entornos antes de aplicar cambios allí. No ejecutarlo a ciegas en otro proyecto.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.denuncias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.perfiles(id) on delete restrict,
  denunciante_id uuid not null default auth.uid() references public.perfiles(id) on delete restrict,
  postulacion_id text not null references public.postulaciones(id) on delete restrict,
  chat_id text references public.chats(id) on delete set null,
  motivo text not null check (motivo in (
    'Es una empresa falsa',
    'Suplantación de identidad',
    'Lenguaje inapropiado',
    'Condiciones Inaceptables',
    'Contenidos obscenos o de odio',
    'Spam o Confuso',
    'Otros'
  )),
  motivo_otro text,
  mensaje text not null default '' check (char_length(mensaje) <= 2000),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_revision', 'resuelta', 'desestimada')),
  created_at timestamptz not null default now(),
  constraint denuncias_motivo_otro_check check (
    (motivo = 'Otros' and nullif(btrim(motivo_otro), '') is not null)
    or (motivo <> 'Otros' and motivo_otro is null)
  )
);

create index if not exists denuncias_empresa_created_idx
  on public.denuncias (empresa_id, created_at desc);
create index if not exists denuncias_estado_created_idx
  on public.denuncias (estado, created_at desc);
create index if not exists denuncias_postulacion_idx
  on public.denuncias (postulacion_id);

alter table public.denuncias enable row level security;
revoke all on public.denuncias from anon, authenticated;
grant insert on public.denuncias to authenticated;

-- La validación se encapsula en private para evitar recursión entre las políticas
-- RLS de denuncias, perfiles, postulaciones y búsquedas.
create or replace function private.puede_denunciar_empresa(
  p_empresa_id uuid,
  p_postulacion_id text,
  p_chat_id text default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.perfiles perfil
      join public.postulaciones p on p.candidato_id = perfil.id
      join public.busquedas b on b.id = p.oferta_id
     where perfil.id = (select auth.uid())
       and perfil.rol = 'c'
       and p.id = p_postulacion_id
       and b.empresa_id = p_empresa_id
       and (
         p_chat_id is null
         or exists (
           select 1
             from public.chats ch
            where ch.id = p_chat_id
              and ch.postulacion_id = p.id
              and ch.candidato_id = perfil.id
              and ch.empresa_id = b.empresa_id
         )
       )
  );
$$;

revoke all on function private.puede_denunciar_empresa(uuid, text, text) from public, anon;
grant execute on function private.puede_denunciar_empresa(uuid, text, text) to authenticated;

drop policy if exists "Los postulantes pueden denunciar empresas vinculadas a sus postulaciones"
  on public.denuncias;
create policy "Los postulantes pueden denunciar empresas vinculadas a sus postulaciones"
on public.denuncias
for insert
to authenticated
with check (
  denuncias.denunciante_id = (select auth.uid())
  and private.puede_denunciar_empresa(empresa_id, postulacion_id, chat_id)
);

-- Fuente pública mínima del distintivo visual. Los usuarios solo pueden consultar;
-- las altas y bajas se producen mediante la revisión manual interna.
create table if not exists public.empresas_verificadas (
  empresa_id uuid primary key references public.perfiles(id) on delete cascade,
  verified_at timestamptz not null default now()
);

alter table public.empresas_verificadas enable row level security;
revoke all on public.empresas_verificadas from anon, authenticated;
grant select on public.empresas_verificadas to authenticated;

drop policy if exists "Usuarios autenticados pueden consultar empresas verificadas"
  on public.empresas_verificadas;
create policy "Usuarios autenticados pueden consultar empresas verificadas"
on public.empresas_verificadas
for select
to authenticated
using (true);

-- Expediente interno: no tiene políticas ni privilegios para usuarios finales.
create table if not exists private.empresa_verificacion_revisiones (
  empresa_id uuid primary key references public.perfiles(id) on delete cascade,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'verificada', 'rechazada')),
  notas_internas text,
  revisado_por uuid references auth.users(id) on delete set null,
  revisado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.empresa_verificacion_revisiones enable row level security;
revoke all on private.empresa_verificacion_revisiones from public, anon, authenticated;

create or replace function private.sync_empresa_verificada()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.estado = 'verificada' then
    insert into public.empresas_verificadas (empresa_id, verified_at)
    values (new.empresa_id, coalesce(new.revisado_at, now()))
    on conflict (empresa_id) do update
      set verified_at = excluded.verified_at;
  else
    delete from public.empresas_verificadas where empresa_id = new.empresa_id;
  end if;
  return new;
end;
$$;

revoke all on function private.sync_empresa_verificada() from public, anon, authenticated;

drop trigger if exists sync_empresa_verificada
  on private.empresa_verificacion_revisiones;
create trigger sync_empresa_verificada
after insert or update of estado, revisado_at
on private.empresa_verificacion_revisiones
for each row execute function private.sync_empresa_verificada();

comment on table public.denuncias is
  'Denuncias de empresas enviadas por postulantes. El equipo Match Empleos las revisa desde Supabase SQL Editor con permisos administrativos.';
comment on table public.empresas_verificadas is
  'Listado público mínimo de empresas verificadas; solo el equipo Match Empleos puede modificarlo desde SQL Editor.';
comment on table private.empresa_verificacion_revisiones is
  'Registro interno de revisión y verificación de empresas; accesible al equipo desde SQL Editor.';
