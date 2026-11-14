## 8. Base de datos

### Proyectos

| Entorno | Proyecto | Uso |
|---|---|---|
| Staging | `gtnxlkqumppeintdpycn` (us-east-1) | Entorno de pruebas. Conserva datos y estructuras históricas; el frontend carga únicamente registros reales de Supabase. |
| Producción | `mijmzywmrazzaqypuwhu` (us-east-2) | Dominio `matchempleos.com.ar`. Arranca limpio, sin datos de prueba. |

Los dos proyectos se configuran por separado: esquema, permisos, buckets, URLs de redirección y SMTP. Las migraciones se aplican a cada uno por separado.

Diferencias intencionales entre staging y producción (ver migración `009`):
- Staging conserva columnas y una política heredadas del esquema anterior de chats: `mensajes.de`, `mensajes.chat_key`, la restricción `mensajes_de_check`, el índice `mensajes_chat_idx` y la política "historial anterior solo lectura". Producción no los tiene. No se eliminan en esta tarea porque forman parte del esquema remoto y pueden contener registros históricos.
- Producción tiene la función `rls_auto_enable`, creada por la opción "Enable automatic RLS" del dashboard.
- Staging tenía un bucket `subidas` sin uso que hay que borrar desde el dashboard.

### Migraciones

- Se aplican en orden numérico. `000` es la base completa de producción y ya incluye el efecto de `003` a `008`. Para un proyecto nuevo, aplicar `000` y después las que vengan después de la `009`.
- `002` es **destructiva**: recrea las tablas. No se vuelve a correr sobre una base con datos.
- `003` borra los datos de prueba de chats y candidatos en `si`/`mas`. Solo corresponde a staging. **No correrla en producción** (producción ya tiene su estado correcto).
- `004` a `009` son para staging. Su efecto ya está incluido en `000`.
- Todo cambio futuro va en un archivo nuevo, numerado a partir de `012`. Las `010` y `011` ya están aplicadas en staging y en producción. No cambiar tablas a mano en el editor de Supabase.

- Los scripts de `supabase/sql/` son SQL de referencia/ejecución manual: **un merge de GitHub no los aplica en Supabase**. Revisar siempre el proyecto destino antes de ejecutarlos.
- `denuncias_y_verificacion_empresas.sql` quedó alineado con el estado verificado en **producción** el 12/11/2026: la política de INSERT llama a `private.puede_denunciar_empresa()`, que encapsula la validación de pertenencia y evita la recursión RLS. Staging todavía conserva una política anterior que consulta las tablas directamente; no asumir que ambos entornos tienen la misma definición.
- `anonymous_sobre_ai_single_use.sql` incluye RLS en `private.anonymous_ai_usage` y limita las RPC de reserva/cierre a `service_role`. En producción RLS ya está activo; en staging se observó desactivado al auditarlo, por lo que ese script también documenta la corrección necesaria allí.

### Tablas

| Tabla | Contenido | Clave / relaciones |
|---|---|---|
| `perfiles` | Una fila por cuenta. `rol` (`c`/`e`), `nombre`, `avatar_url`, `datos` (jsonb con el onboarding y el CV), `cupo`, `cupo_semana_inicio`, `tasa`, `demora`, `plazo`. | `id` = `auth.users.id`, `on delete cascade`. |
| `busquedas` | Búsquedas publicadas por una empresa. `estado` (`Activa` por defecto), `total`. | `empresa_id` → `perfiles`. |
| `postulaciones` | Postulación de un candidato a una búsqueda. `estado` (`Enviada`, `Vista`, `Respondida`), `datos` (objeto de la postulación). | `candidato_id` → `perfiles`. Único por (candidato, oferta). |
| `candidatos_estado` | Respuesta de la empresa a una postulación: `si`, `mas` o `no`. `id` = `postulaciones.id`. | `empresa_id` → `perfiles`. |
| `chats` | Un chat por postulación con Match mutuo. Sin vencimiento. | `postulacion_id` único; `candidato_id` y `empresa_id` → `perfiles`. |
| `mensajes` | Mensajes de un chat. `autor_id` identifica al que escribe; `texto` y `h` (hora). Inmutables: no tienen UPDATE ni DELETE. | `chat_id` → `chats`; `autor_id` → `perfiles`. |

Staging además conserva `mensajes.de` y `mensajes.chat_key` de un esquema anterior de conversaciones.

### Funciones del servidor

| Función | Quién la llama | Qué hace |
|---|---|---|
| `handle_new_user()` | Trigger `on_auth_user_created` | Crea la fila de `perfiles` desde `raw_user_meta_data`. |
| `postular(p_id, p_oferta, p_datos)` | Cliente (RPC) | Valida cupo, evita postulaciones repetidas, crea la postulación y descuenta el cupo, en una transacción. |
| `cupo_actual()` | Cliente (RPC) al cargar la sesión | Devuelve el cupo vigente. Si empezó una semana nueva, lo renueva a 5. |
| `inicio_semana_ar()` | Interna | Lunes 00:00 de Buenos Aires. |
| `abrir_chat_con_match()` | Trigger sobre `candidatos_estado` | Crea el chat cuando la empresa marca `si` sobre una postulación suya. |
| `recalcular_tasa(empresa)` | Triggers sobre `postulaciones` y `candidatos_estado` | Recalcula `perfiles.tasa`. |

Las funciones `SECURITY DEFINER` no son ejecutables por `anon` ni `public`. Solo `cupo_actual` y `postular` son invocables por usuarios logueados, y validan `auth.uid()` adentro.

### Reglas de cupo y tasa

- **Cupo**: 5 postulaciones por semana. Se renuevan los lunes a las 00:00 hora de Buenos Aires. Lo controla el servidor; el cliente no puede modificar `cupo`.
- **Tasa**: respondidas ÷ total de postulaciones recibidas. Se recalcula sola cada vez que cambia una postulación o una respuesta.

### RLS (Row Level Security)

Todas las tablas tienen RLS activo.

- `perfiles`: cada uno lee y edita su propia fila. Los candidatos leen los perfiles de empresas (`rol = 'e'`). Las empresas leen los perfiles de los postulantes a sus búsquedas.
- `busquedas`: la empresa gestiona las suyas. Los candidatos leen las activas.
- `postulaciones`: el candidato gestiona las suyas. La empresa las lee y actualiza (`estado`, `datos`, `updated_at`) solo si la búsqueda es suya.
- `candidatos_estado`: la empresa gestiona las suyas.
- `chats`: lectura solo para los dos miembros.
- `mensajes`: lectura y escritura solo para los miembros del chat. Se escribe solo como uno mismo (`autor_id = auth.uid()`). No hay UPDATE ni DELETE.

**Privilegios de tabla:** `anon` no tiene ningún permiso sobre las tablas. `authenticated` tiene solo lo que usa la app:

| Tabla | Permisos |
|---|---|
| `busquedas`, `candidatos_estado` | select, insert, update, delete |
| `chats` | select |
| `mensajes` | select, insert |
| `perfiles` | select; update solo de `nombre`, `avatar_url`, `datos` |
| `postulaciones` | select; update solo de `estado`, `datos`, `updated_at` (el alta pasa por `postular`) |

`TRUNCATE`, `REFERENCES` y `TRIGGER` están revocados. `TRUNCATE` ignora RLS.

### Storage

| Bucket | Público | Límite | Ruta | Quién lee / escribe |
|---|---|---|---|---|
| `avatars` | Sí | 2 MB; JPG, PNG, WEBP | `{user_id}/avatar` | Cada usuario, en su carpeta. La lectura pública es por URL. |
| `cvs` | No | 5 MB; solo PDF | `{candidato_id}/cv.pdf` | El candidato, en su carpeta. La empresa, solo si el candidato se postuló a una de sus búsquedas. Se abre con enlace firmado de 5 minutos. |

### Realtime

La publicación `supabase_realtime` incluye `mensajes` y `chats`. El cliente se suscribe a inserts de `mensajes` (por chat) y a inserts de `chats` (para recargar la sesión cuando empieza un chat nuevo). RLS aplica también a Realtime.

### Configuración del proyecto (Dashboard)

Esto no se puede versionar con SQL. Hay que hacerlo en cada proyecto.

- **Authentication > URL Configuration**:
  - Staging: Site URL el de pruebas; Redirect URLs con `127.0.0.1:5500`, `localhost:5500`, el dominio de pruebas y `matchempleos.com.ar`.
  - Producción: Site URL `https://matchempleos.com.ar`; Redirect URLs `https://matchempleos.com.ar` y `https://www.matchempleos.com.ar`. Nada más.
- **Authentication > Sign In / Providers > Email**: "Confirm email" decide si hay que confirmar antes de entrar.
- **Authentication > Notifications > Emails > Security**: activar "Password changed" y "Email address changed".
- **Authentication > Email Templates**: revisar los textos en español antes de salir al público.
- **Authentication > Attack Protection**: la protección contra contraseñas filtradas requiere plan Pro y todavía no está activa.
- **SMTP**: por ahora se usa el SMTP de Supabase, con límites bajos. Antes de escalar, conviene un proveedor propio (Resend, Amazon SES, Postmark) con subdominio y SPF, DKIM y DMARC.
- **Storage**: crear los buckets desde las migraciones, no desde el dashboard.

---

## 25. Error de permisos en `public.postulaciones` en producción (13 de noviembre de 2026)

- En los logs del proyecto Supabase de producción (`mijmzywmrazzaqypuwhu`) se observaron errores PostgreSQL `42501` con el mensaje `permission denied for table postulaciones`. Los eventos compartidos aparecieron repetidamente, aproximadamente cada 3–5 segundos.
- El error indica que una operación intentó acceder a `public.postulaciones` sin contar con los privilegios SQL necesarios para esa operación. Por sí solo, el código `42501` no identifica qué consulta o función la originó ni demuestra si se trató de SELECT, INSERT, UPDATE o DELETE.
- En una revisión anterior se comunicó que el rol `authenticated` tenía SELECT pero no INSERT, UPDATE ni DELETE, y que solo existían dos políticas RLS de lectura. **Esa conclusión no quedó respaldada por resultados de inspección SQL legibles y verificables; debe considerarse no confirmada y no utilizarse como diagnóstico definitivo.** La inspección debe repetirse con consultas de solo lectura que devuelvan explícitamente los privilegios efectivos, el estado de RLS y las políticas vigentes.
- Es importante distinguir `public.postulaciones` de `public.busquedas`: las empresas publican ofertas en `busquedas`; los candidatos crean postulaciones a esas ofertas. Este error no demuestra, por sí mismo, que la publicación de búsquedas por parte de una empresa esté afectada.
- La frecuencia de los eventos podría corresponder a una consulta o reintento automático del frontend, una función o un proceso backend. Todavía no se identificó el origen exacto ni el punto del código que ejecuta la operación.
- **No se modificaron GRANT, políticas RLS, funciones, tablas ni datos de producción** como parte de esta revisión. No se deben conceder permisos de escritura de forma general sin identificar primero la operación y definir las reglas de negocio.
- Próximos pasos de diagnóstico:
  - [ ] Consultar por separado los privilegios efectivos de `anon` y `authenticated` sobre `public.postulaciones` (SELECT, INSERT, UPDATE y DELETE).
  - [ ] Inspeccionar `relrowsecurity`, `relforcerowsecurity` y todas las políticas RLS de `public.postulaciones`, incluyendo roles, comandos y expresiones `USING`/`WITH CHECK`.
  - [ ] Identificar en el frontend, RPCs, triggers o Edge Functions qué operación genera el error y por qué se repite.
  - [ ] Definir quién puede crear una postulación, quién puede cambiar su estado y si existe algún caso legítimo de eliminación.
  - [ ] Solo después, proponer los GRANT mínimos y las políticas RLS correspondientes; aplicar cambios en staging y probarlos antes de producción.

---

## 26. Consumo de Logs Query en Supabase (13 de noviembre de 2026)

- En el panel de Usage de la organización Match Empleos se observó un consumo de **103,3 GB sobre un allowance de 100 GB** de Logs Query: 3,3 GB (3,3 %) por encima del umbral mostrado.
- **Logs Query no es almacenamiento de la base de datos ni volumen de correos, y actualmente no genera un cargo directo por excedente.** Mide el volumen de logs escaneado al consultarlos desde Supabase Studio, API, CLI u otras integraciones. No debe confundirse con Logs Ingest, que mide el volumen de logs generado/recibido.
- Según la documentación de Supabase consultada el 13/11/2026, el enforcement de los límites de Logs Query figura como **“Not yet enforced”**. Por lo tanto, el valor de 103,3 GB no implica por sí mismo un cobro, pérdida de datos ni una restricción inmediata del servicio. Las posibles limitaciones futuras descritas por Supabase no deben tratarse como activas hasta que la plataforma anuncie el enforcement.
- Supabase también comunicó que existen problemas conocidos de medición que pueden inflar el consumo reportado. No se puede determinar qué proporción del valor observado corresponde a medición incorrecta.
- El allowance de 100 GB corresponde al plan Free de la organización. La cifra no significa que la base de datos tenga 100 GB ocupados ni que se hayan almacenado 103,3 GB de logs.
- Las consultas repetidas y las ventanas amplias pueden incrementar el volumen escaneado: una consulta de siete días puede escanear aproximadamente siete veces más que una de un día, y repetir una consulta vuelve a escanear los datos. Durante la depuración de autenticación y SMTP se realizaron varias consultas de logs; pudieron contribuir al consumo, pero no hay evidencia para atribuirles todo el excedente ni calcular su proporción.
- **No se desactivaron logs, no se cambiaron planes y no se modificó la base de datos** por este indicador. No se requiere una migración SQL ni un cambio de frontend para corregirlo.
- Recomendaciones operativas:
  - [ ] Evitar consultas repetidas o polling de Logs Explorer.
  - [ ] Usar ventanas temporales acotadas y filtros por servicio, endpoint, estado y entorno desde el inicio de la consulta.
  - [ ] Seleccionar explícitamente el proyecto de staging o producción antes de consultar logs.
  - [ ] Revisar Logs Ingest por separado; no inferir su consumo a partir de Logs Query.
  - [ ] Mantener los logs de Auth y Postgres habilitados, porque son necesarios para diagnosticar problemas de registro, acceso y permisos.
  - [ ] Si se necesita una investigación adicional, hacer consultas puntuales y de solo lectura, evitando barridos amplios del historial.