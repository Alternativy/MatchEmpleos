# Match Empleos

Plataforma que conecta candidatos (personas que buscan trabajo) con empresas que publican búsquedas. Idioma de la interfaz: **español rioplatense** (voseo: "Creá", "Contanos", "Escribí").

Este documento está pensado para dos lectores: personas del equipo y agentes de IA que trabajen en el proyecto. Si sos un agente, leé primero la sección [Reglas para agentes](#11-reglas-para-agentes-de-ia).

---

## 1. Resumen rápido

| Qué | Dónde / cómo |
|---|---|
| Frontend | Un único archivo: `index.html` (HTML + CSS + JS). Sin build, sin npm, sin framework. |
| Backend | Supabase (Postgres + Auth + Storage + Realtime + API REST). |
| Cliente de Supabase | `vendor/supabase.js` (versión **2.45.4**, copiada tal cual desde npm). |
| Entornos | **Staging** (`gtnxlkqumppeintdpycn`) y **producción** (`mijmzywmrazzaqypuwhu`). Son proyectos separados. |
| Selección de entorno | Por host: `matchempleos.com.ar` y `www.matchempleos.com.ar` usan producción; cualquier otro host (GitHub Pages, Netlify de pruebas, localhost) usa staging. |
| Migraciones SQL | `supabase/migrations/`, de `000` a `009`. Ver [sección 8](#8-base-de-datos). |
| Repos | `Alternativy/test-empleos` (desarrollo y pruebas) y el repo `matchempleos` (producción). Ver [flujo de trabajo](#flujo-de-trabajo). |

---

---

## 2. Cómo correr el proyecto en local

1. Clonar el repo.
2. Servir la carpeta con un servidor estático, por ejemplo **Live Server** de VS Code ("Go Live"). **No abrir `index.html` con doble clic**: Supabase Auth necesita un origen `http://`.
3. Verificar en la consola la línea `[db] entorno: staging`. En local siempre debe ser staging. Si aparece `prod`, el host no es el esperado.

Para que el login y los enlaces de correo funcionen en local, el host (por ejemplo `http://127.0.0.1:5500`) tiene que estar en **Authentication > URL Configuration > Redirect URLs** del proyecto de **staging**. Producción no tiene esos hosts, a propósito.

---

---

## 3. Estructura del repo

```
index.html                              App completa (estilos, datos, routing, UI, auth y acceso a datos)
vendor/supabase.js                      Cliente de Supabase 2.45.4 (código de terceros, no editar)
img/                                    Logos, avatares, ilustraciones y favicons
  favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, site.webmanifest
supabase/functions/mejorar-sobre/index.ts  Edge Function para mejorar el campo “Sobre vos” con IA
supabase/migrations/
  000_esquema_produccion.sql            Esquema base completo, consolidado (ver sección 8)
  001_crud_inicial.sql                  Histórica, superada
  002_auth_por_usuario.sql              Histórica, destructiva (recrea tablas)
  003_chats_y_mensajes.sql              Chats por Match mutuo y mensajes con autor
  004_revocar_execute_funciones_definer.sql
  005_bucket_cvs.sql                    Bucket privado de CVs
  006_permisos_perfiles_y_tasa.sql      Permisos de perfiles; tasa calculada en servidor
  007_cupo_semanal.sql                  Cupo de 5 postulaciones por semana (RPC postular)
  008_empresa_actualiza_postulaciones.sql
  009_alinear_staging_produccion.sql    Alineación de permisos de staging con producción
  010_busquedas_jornada_turno_y_borrado.sql  Jornada y turno en búsquedas; borrado seguro (RPC borrar_busqueda)
  011_pausar_busquedas.sql              Búsquedas pausadas no reciben postulaciones (postular valida estado)
robots.txt                             Permite indexar la raíz y apunta al sitemap
sitemap.xml                            Lista la landing (única URL indexable)
README.md                               Este documento
```

### Estructura interna de `index.html`

1. **Estilos** (`<style>`): variables CSS en `:root` (`--navy`, `--green`, `--gray`, `--navy2`, `--line`, etc.), con paleta azul prusiano, verde primaveral y alabastro. Clases como `.btn`, `.field`, `.chip`, `.ccard`, `.bub`, `.fila`.
2. **Script de datos** (primer `<script>`): configuración de entornos (`ENTORNOS`, `HOSTS_PRODUCCION`), cliente de Supabase (`sb`), identidad (`ME`), helpers de Storage (`subirFoto`, `subirCV`, `verCV`) y el objeto `DB` con todas las escrituras y lecturas.
3. **Script principal** (segundo `<script>`, dentro de una IIFE): estado global `S`, estado inicial vacío (`freshState`), plantillas de pantallas, routing (`route`), autenticación, handlers de eventos y arranque (`hidratar`, Realtime).

---

---

## 4. Routing

La app usa rutas por hash (`#/...`). No hay servidor de rutas.

| Ruta | Pantalla |
|---|---|
| `#/` | Landing pública. Con sesión muestra la foto de perfil (lleva a la app) y "Cerrar sesión"; sin sesión, "Iniciar sesión" y "Registrarse". |
| `#/login`, `#/recuperar`, `#/nueva-clave` | Autenticación |
| `#/registro`, `#/registro/c/1..5`, `#/registro/e/1..5`, `#/registro/terminos/{c\|e}` | Registro de candidato y de empresa |
| `#/confirmar` | "Revisá tu correo" |
| `#/c/feed`, `#/c/oferta/:id`, `#/c/match/:id` | Candidato: feed de ofertas, detalle y confirmación de Match |
| `#/c/postulaciones`, `#/c/mensajes`, `#/c/chat/:id`, `#/c/notificaciones` | Candidato: seguimiento, conversaciones, notificaciones |
| `#/c/perfil`, `#/c/datos`, `#/c/config`, `#/c/salir` | Candidato: perfil (datos personales y CV), configuración y salida |
| `#/e/panel`, `#/e/publicar`, `#/e/candidatos`, `#/e/candidato/:id`, `#/e/responder/:id/:tipo` | Empresa: panel de búsquedas, publicación, candidatos y respuestas |
| `#/e/mensajes`, `#/e/chat/:id`, `#/e/notificaciones` | Empresa: conversaciones y notificaciones |
| `#/e/empresa`, `#/e/datos`, `#/e/config`, `#/e/salir` | Empresa: perfil de la empresa, datos, configuración y salida |
| `#/privacidad`, `#/terminos`, `#/ayuda` | Páginas legales |

**Guardia de rutas:** `route()` deja pasar sin sesión solo a las rutas de `PUBLICAS`. Un candidato que entra a `#/e/...` (o al revés) es redirigido a su área.

**Logo de Match Empleos:** en la landing, con sesión lleva al feed (candidato) o al panel (empresa); sin sesión, a `#/login`. En el resto de las pantallas lleva a `#/`.

---

---

## 5. Estado de la aplicación

- `S` es el estado de la UI en memoria: `S.c` (candidato) y `S.e` (empresa). Se construye con `freshState()`.
- `freshState()` inicializa las colecciones vacías. No precarga perfiles, ofertas, postulaciones, chats ni notificaciones ficticias.
- `hidratar()` carga desde Supabase las postulaciones, búsquedas, respuestas (`candidatos_estado`), mensajes, chats, cupo y tasa correspondientes al usuario autenticado. El frontend no combina esos resultados con datos de muestra.
- **Cupo** (`S.c.cupo`): lo entrega el servidor con `cupo_actual()` al cargar la sesión.
- **Tasa de respuesta** (`perfiles.tasa`): la calcula el servidor. Es respondidas ÷ total de postulaciones recibidas, y 100 % si no hay ninguna. El cliente la recalcula para mostrarla y no la escribe.
- Las ofertas obtenidas de Supabase llevan `real: true` como marca de procedencia. `apply()` rechaza cualquier elemento que no tenga esa marca y llama a la RPC `postular`, que descuenta el cupo y crea la postulación en la misma transacción.
- `ME` guarda la identidad de la sesión: `ME.id` (uuid de Auth), `ME.rol` (`'c'` o `'e'`), `ME.nombre`, `ME.email`, `ME.datos` y `ME.avatarUrl`.

---

---

## 6. Estado inicial y carga de datos

- `freshState()` contiene colecciones vacías para ofertas, postulaciones, búsquedas, candidatos, chats y notificaciones. No incorpora registros ficticios ni conversaciones precargadas.
- Después de autenticar, `hidratar()` obtiene las publicaciones, postulaciones, estados, chats y mensajes correspondientes desde Supabase.
- `apply()` solo permite postularse a ofertas marcadas como provenientes de Supabase (`real: true`) y utiliza `DB.postular()`; no simula cambios de estado ni respuestas automáticas.
- `sendChat()` guarda únicamente el mensaje que envía el usuario. La respuesta debe llegar desde la otra cuenta mediante la base de datos y Realtime.
- No borrar datos históricos de staging como parte de un cambio de frontend sin una instrucción y respaldo específicos.

---

## 6c. Mejora del campo “Sobre vos” con IA

- El registro de postulante (paso 5) y la edición de datos personales muestran el botón **“Mejorar con IA”** debajo del texto original.
- El botón envía el texto a la Edge Function `mejorar-sobre`. La sugerencia aparece en un segundo campo editable; no reemplaza el original automáticamente.
- **“Usar esta versión”** copia la sugerencia al campo original. La persona puede editarla antes de guardarla o crear la cuenta.
- Ambas Edge Functions (`mejorar-sobre` y `sugerir-respuestas-chat`) usan Gemini como proveedor principal y Groq como alternativa. El orden es `gemini-3.5-flash-lite`, `gemini-3.8-flash`, `openai/gpt-oss-120b` y `qwen/qwen3.8-27b`. Los dos últimos son modelos servidos por **Groq**; no requieren una cuenta ni una clave de OpenAI.
- **Claves de proveedores:** configurar `GEMINI_API_KEY` y `GROQ_API_KEY` en el proyecto Supabase correspondiente, en **Edge Functions → Secrets**. Se configuran por separado en staging y producción. Si falta una de las dos, la función omite ese proveedor y continúa con el disponible; si faltan ambas, devuelve un error de configuración. No existe dependencia de `OPENAI_API_KEY`.
- **Variables de Supabase:** el código obtiene `SUPABASE_URL` y las claves del proyecto desde el entorno de Edge Functions. Para la clave pública acepta `SUPABASE_PUBLISHABLE_KEYS` (formato JSON con propiedad `default`) o el nombre heredado `SUPABASE_ANON_KEY`; para la clave privilegiada acepta `SUPABASE_SECRET_KEYS` (formato JSON con propiedad `default`) o `SUPABASE_SERVICE_ROLE_KEY`. Son credenciales de servidor: no copiarlas a `index.html`, al repositorio ni al navegador. Nunca exponer la clave secret/service-role al cliente.
- **Autenticación de las funciones:** el despliegue usa `verify_jwt: false` para que el handler pueda controlar el flujo. Esto no deja las operaciones sin autenticación: ambas funciones validan el Bearer token contra `/auth/v1/user`. `mejorar-sobre` también admite visitantes, pero exige un UUID anónimo y reserva un único uso en el backend. `sugerir-respuestas-chat` exige una sesión válida, rol de empresa y pertenencia del chat a esa empresa. No quitar estas validaciones internas.
- **Estado de despliegue verificado el 12/11/2026:** en producción ambas funciones están activas y tienen `verify_jwt: false`. En staging, `mejorar-sobre` está activa con `verify_jwt: false` y `sugerir-respuestas-chat` figura con `verify_jwt: true`; mantener presente esa diferencia al probar o redeplegar.
- La función `mejorar-sobre` valida el cuerpo y limita el texto a 4.000 caracteres. Tiene un límite temporal en memoria de 8 solicitudes por IP por minuto; es una protección básica y no reemplaza un rate limiter persistente para producción.
- Los usuarios autenticados reservan cuota mediante RPC: 5 mejoras por día y 50 por mes. Los visitantes tienen una única mejora, identificada con UUID local y hash SHA-256 reservado en `private.anonymous_ai_usage`. La cuota se confirma como consumida solo cuando el proveedor devuelve una respuesta exitosa; si todos los proveedores fallan, se libera la reserva.
- El frontend muestra la herramienta tanto en staging como en producción. En registro, la mejora se aplica solo si el usuario elige la propuesta; el texto original no se reemplaza automáticamente. El texto y la respuesta generada no se guardan como contenido en Supabase; solo se persiste la metadata necesaria para controlar las cuotas.
- Para habilitar los proveedores en un entorno, configurar `GEMINI_API_KEY` y/o `GROQ_API_KEY` en **Edge Functions → Secrets** del proyecto correspondiente y desplegar las funciones. No configurar `OPENAI_API_KEY`: el modelo `openai/gpt-oss-120b` se consulta a través de la API de Groq.

---

## 6b. SEO y contenido estático de la landing

- `index.html` tiene metadatos en el `<head>`: `title`, `meta description`, `canonical`, Open Graph, Twitter Card y datos estructurados JSON-LD (`Organization` y `WebSite`). No hay `FAQPage`, a propósito.
- El script de `<head>` agrega `<meta name="robots" content="noindex, nofollow">` cuando el host no es `matchempleos.com.ar` ni `www.matchempleos.com.ar`. Por eso los entornos de prueba no se indexan.
- La landing tiene **una sola fuente de texto**: el HTML dentro de `<div id="root">` en `index.html` (encabezado, hero, "¿Quiénes somos?", "Situación actual en Argentina", "¿Cómo funciona?", "¡El futuro no espera, vos tampoco!" y pie). Ese HTML se guarda en `LANDING_HTML` al arrancar. `home()` lo reutiliza y solo ajusta lo que depende de la sesión (enlace del logo y menú de cuenta). `siteFooter()` toma el pie del mismo HTML.
- **Para cambiar un texto de la landing, editá solo el HTML de `#root`.** No hay copia en JavaScript. El pie que usan las demás pantallas sale del mismo bloque.
- Como el contenido existe en el HTML, se ve y se indexa aunque no cargue JavaScript.
- `titleFor()` cambia el título de la pestaña según la vista. La landing mantiene el título completo.
- Las imágenes llevan `loading="lazy"`, excepto el hero y el logo del encabezado.
- Las rutas con hash (`#/privacidad`, `#/terminos`, `#/ayuda`) no son URLs que un buscador indexe por separado. Está pendiente separarlas en páginas propias (ver sección 12).

---

## 7. Autenticación

### Flujo de registro (candidato)

1. **`#/registro`**: el usuario elige "Busco trabajo" o "Busco gente para mi empresa". Antes escribe correo y contraseña. Los botones quedan deshabilitados hasta que son válidos.
2. **Paso 1** (`#/registro/c/1`): nombre, apellido, correo y contraseña. El correo y la contraseña tienen que coincidir con los de la pantalla anterior (`verificarCoincidencia`).
3. **Pasos 2 a 5**: edad, ubicación, experiencia, rubros, tipo de empleo, modalidad, horario, perfil y **CV en PDF** (paso 5). En el `index.html` actual, los campos se mantienen en `regDraft` y los chips en `S.reg`, ambos en memoria JavaScript. El PDF seleccionado se mantiene en `regCvFile`. **No hay persistencia en localStorage ni IndexedDB en el código actual**: refrescar la página puede perder los datos y el CV aún no subido. La persistencia entre refrescos sigue pendiente.
4. **Términos** (`#/registro/terminos/c`): el botón "Crear mi cuenta" llama a `crearCuenta()`.
5. **`crearCuenta()`** llama a `sb.auth.signUp` con:
   ```js
   { email, password, options: { data: { rol, nombre, display_name, full_name, datos: perfilDatos() } } }
   ```
   `perfilDatos()` junta los campos `rc-*`, `re-*` y `rx-*` (sin correo, contraseña ni CV) y los chips de `S.reg`.
6. Si la confirmación por correo está activa, `data.session` es `null` y la app muestra `#/confirmar`. Si no, entra directo.
7. Si hay sesión y hay CV, `crearCuenta()` lo sube con `subirCV(file, user.id)`. Si no hay sesión, el archivo no sobrevive a la recarga por el enlace de confirmación: la app avisa que hay que subirlo desde "Datos personales".
8. El trigger `on_auth_user_created` ejecuta `handle_new_user()`, que crea la fila en `perfiles` con `rol`, `nombre` y `datos`.
9. Al confirmar el correo, el enlace vuelve a la URL base. El listener de `onAuthStateChange` detecta `SIGNED_IN` y lleva al panel correspondiente.

### Login

- `iniciarSesionForm()` valida formato de correo y largo de contraseña (mínimo 8) antes de llamar a `sb.auth.signInWithPassword`. Mientras espera la respuesta, el botón muestra un spinner y queda deshabilitado.
- Si el correo no está confirmado, se muestra un mensaje con el botón "Reenviar correo" (`sb.auth.resend`).
- Si las credenciales no coinciden, se muestra un mensaje genérico con el enlace "¿Olvidaste tu contraseña?". El motivo real se registra en la consola (`[auth] login falló`).
- Ante un login exitoso, `setSesion()` obtiene `rol`, `nombre`, `datos` y `avatar_url` desde `perfiles`, hidrata los datos de la cuenta y redirige a `#/c/feed` o `#/e/panel` según el rol. Si la cuenta no tiene perfil o rol, se cierra la sesión y se informa el problema.
- **Verificación estática actual (12/11/2026):** se comprobó la validación, `signInWithPassword`, la carga de perfil, la guardia de rutas y la redirección por rol. El bloque `try/finally` restablece el botón, pero el código actual no tiene `catch` para excepciones inesperadas de red. No se realizó una prueba end-to-end contra Supabase con credenciales reales.

### Recuperación de contraseña

- `recuperarForm()` llama a `resetPasswordForEmail` con `redirectTo` = origen + ruta actual (sin hash).
- Al volver desde el correo, Supabase emite `PASSWORD_RECOVERY` y la app lleva a `#/nueva-clave`.

### Cerrar sesión

- Desde la landing o desde la sección "Salir" de la app, `#/c/salir` o `#/e/salir`. Llama a `sb.auth.signOut()` y limpia `ME` y `S`.

### Reglas de validación en formularios

| Campo | Regla |
|---|---|
| Correo | Formato `algo@algo.dominio` (regex `EMAIL_RE`). |
| Contraseña | Mínimo 8 caracteres. |
| Nombre, apellido, responsable | Solo letras de alfabetos latinos y espacios (`\p{Script=Latin}`). Sin números ni símbolos. |
| Edad | Solo dígitos, máximo 2. |
| Correo y contraseña del paso 1 | Deben coincidir con los de "Busco trabajo". |
| CV | Solo PDF, máximo 5 MB. |
| Foto de perfil | JPG, PNG o WEBP, máximo 2 MB. |

Los campos conservan lo escrito al volver atrás: `regField()` y los inputs de `registro()` leen `regDraft`.

---

---

## Búsquedas de la empresa

- Cada búsqueda tiene puesto, descripción, **jornada** y **turno** (columnas `busquedas.jornada` y `busquedas.turno`, arrays de texto).
- En "Búsquedas" del panel, cada tarjeta abre el detalle de la búsqueda. Desde ahí se puede ver los candidatos (`Ver candidatos`), editar la búsqueda o eliminarla.
- **Pausar una búsqueda** cambia `busquedas.estado` entre `Activa` y `Pausada`. Una búsqueda pausada no aparece en el feed de candidatos y `postular` la rechaza. Las postulaciones que ya tiene siguen visibles para la empresa.
- **Eliminar una búsqueda** llama a la RPC `borrar_busqueda`, que borra también sus postulaciones, respuestas, chats y mensajes. Es irreversible. La app pide confirmación antes.

---