# Match Empleos

Plataforma que conecta candidatos con empresas que publican búsquedas. Interfaz en español rioplatense.

## Documentación para desarrollo

La documentación está separada por tema para que personas y agentes puedan consultar solo el contexto necesario:

| Documento | Contenido |
|---|---|
| [Arquitectura](docs/ARQUITECTURA.md) | Estructura del frontend, routing, estado, autenticación, funcionalidades y SEO |
| [Supabase](docs/SUPABASE.md) | Proyectos, esquema, migraciones, RLS, Storage, Realtime y diagnósticos |
| [Testing](docs/TESTING.md) | Pruebas locales, GitHub Actions y flujo de ramas con Netlify Deploy Previews |
| [Reglas para agentes de IA](docs/AGENTES-IA.md) | Instrucciones que deben respetar los agentes al modificar el proyecto |
| [Publicación](docs/PUBLICACION.md) | Pendientes y requisitos antes de publicar cambios |
| [Historial técnico](docs/HISTORIAL-TECNICO.md) | Registro de auditorías, cambios y decisiones técnicas |

## Resumen del stack

- **Frontend:** `index.html` (HTML, CSS y JavaScript), sin build ni framework.
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime y API REST).
- **Cliente:** `vendor/supabase.js` 2.45.4. No editar el código de terceros.
- **Entornos:** staging y producción son proyectos Supabase separados. Ver [Supabase](docs/SUPABASE.md).
- **Tests:** Node.js, `node --test tests/*.test.mjs`.
- **Despliegue:** Netlify conectado al repositorio principal.

## Flujo de trabajo

1. Crear una rama desde `main` por cada funcionalidad o corrección (`feature/...` o `fix/...`).
2. Implementar y hacer push a esa rama.
3. Abrir un Pull Request hacia `main`.
4. Revisar el Deploy Preview de Netlify y los checks de GitHub Actions.
5. Corregir en la misma rama hasta que preview y tests estén aprobados.
6. Mergear el PR a `main`; ese merge publica la versión de producción.

Los Deploy Previews deben usar Supabase **staging**. Solo los hosts `matchempleos.com.ar` y `www.matchempleos.com.ar` deben apuntar a producción. No realizar pruebas destructivas desde un preview.

## Desarrollo local

1. Clonar el repositorio.
2. Servir la carpeta con un servidor estático (por ejemplo, Live Server de VS Code). No abrir `index.html` con doble clic: Supabase Auth necesita un origen HTTP.
3. Verificar que la consola indique el entorno `staging`.
4. Para login y enlaces de correo, agregar el host local a **Authentication → URL Configuration → Redirect URLs** del proyecto de staging.

## Estructura principal

```
index.html
vendor/supabase.js
img/
sfx/
supabase/
  functions/
  migrations/
tests/
docs/
.github/workflows/
```

## Reglas de seguridad

- No incluir claves privadas, service-role keys, contraseñas ni secretos en el frontend o el repositorio.
- No ejecutar migraciones destructivas ni borrar datos de staging o producción sin revisión, respaldo y autorización.
- Aplicar y probar cambios SQL primero en staging. Ver [Supabase](docs/SUPABASE.md).
- Antes de modificar una funcionalidad, leer el documento temático correspondiente y verificar el estado real del código; el historial técnico no sustituye una inspección del código actual.

## Generación de CV con IA

- El constructor está integrado en la ruta `#/c/cv` y utiliza la Edge Function `generar-cv` mediante `sb.functions.invoke("generar-cv", { body: { profile } })`. Las claves de los proveedores permanecen en Supabase; no deben incluirse en el frontend ni en el repositorio.
- La función normaliza y limita los datos, genera un CV compatible con ATS y una crítica estructurada, valida la respuesta JSON y devuelve `{ cv, critique, provider }`. La instrucción del modelo prohíbe inventar empleos, fechas, títulos, herramientas, idiomas, logros o métricas.
- Proveedores: Gemini (`gemini-3.5-flash-lite`) como principal y Groq (`openai/gpt-oss-120b`) como alternativa. Configurar `GEMINI_API_KEY` y/o `GROQ_API_KEY` en **Edge Functions → Secrets** de cada proyecto. No guardar los valores en Git.
- **Privacidad:** antes de enviar el perfil a Gemini o Groq, la función excluye nombre, correo electrónico, teléfono, ubicación, LinkedIn y portfolio. El servidor reincorpora esos datos al CV de respuesta. La información profesional —experiencia, formación, habilidades, idiomas, cursos, certificaciones, objetivo y resumen— sí se procesa para generar el documento y su crítica.
- **Autenticación:** mantener `verify_jwt: true`. La función requiere una sesión autenticada y no debe habilitarse para llamadas anónimas.
- **Despliegues verificados:** staging, versión 4; producción, versión 1. Ambos despliegues tienen `verify_jwt: true`. No asumir que un cambio en el repositorio actualiza las Edge Functions: cualquier despliegue posterior debe hacerse por separado y con autorización.
- La respuesta incluye `critique` (resumen, fortalezas, mejoras y criterios Harvard). La interfaz actual aplica `cv` al editor; la presentación del feedback de `critique` todavía requiere integración.
- Los tests estáticos del constructor no reemplazan las pruebas funcionales en navegador. Antes de modificar o redeplegar la función, validar con una cuenta autenticada la generación, el fallback entre proveedores, los errores de autenticación/entrada/proveedor, el guardado, la edición y la descarga PDF.

