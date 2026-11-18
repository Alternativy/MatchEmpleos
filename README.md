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

- El constructor está disponible en la ruta `#/c/cv` para cuentas de postulante. Permite editar los datos, generar contenido con IA, guardar el CV en el perfil y descargarlo como PDF A4 de una página.
- La generación utiliza la Edge Function `generar-cv`. Gemini (`gemini-3.5-flash-lite`) es el proveedor principal y Groq (`openai/gpt-oss-120b`) el fallback. Las claves `GEMINI_API_KEY` y `GROQ_API_KEY` deben permanecer en los secrets del proyecto Supabase; nunca en el frontend ni en Git.
- **Privacidad:** antes de enviar el perfil a los proveedores, la función excluye nombre, correo, teléfono, localidad, LinkedIn y portfolio. El servidor reincorpora esos datos al CV generado. Los datos profesionales necesarios para redactar el documento sí se procesan.
- La función requiere autenticación (`verify_jwt: true`) y aplica límites de tamaño, frecuencia y tiempo de espera. No habilitar acceso anónimo.
- Los despliegues existentes de `generar-cv` son independientes del código del repositorio: staging v4 y producción v1, ambos con JWT obligatorio. Un cambio en esta rama no modifica esos despliegues.
- La respuesta también contiene una crítica estructurada del CV (`critique`); su presentación en la interfaz no está incluida todavía.
- El constructor mantiene una preview A4 vertical. La descarga usa jsPDF local (`vendor/jspdf.umd.min.js`) y html2canvas; no utiliza la impresión del navegador. La foto de perfil es opcional y se controla desde el checkbox del editor.
