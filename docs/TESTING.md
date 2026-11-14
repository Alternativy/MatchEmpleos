# Pruebas y validación

## Flujo de trabajo con ramas y previews

- Crear una rama por funcionalidad o corrección a partir de `main`, por ejemplo `feature/nombre` o `fix/nombre`.
- Trabajar y hacer commits únicamente en esa rama; no desarrollar directamente sobre `main`.
- Abrir un Pull Request hacia `main`. Netlify debe generar un Deploy Preview asociado al PR si el sitio está vinculado al repositorio y la opción Deploy Previews está habilitada.
- Probar el enlace de preview antes de aprobar el PR. Los previews usan el entorno de staging porque el selector de entorno reserva producción para `matchempleos.com.ar` y `www.matchempleos.com.ar`.
- GitHub Actions ejecuta `node --test tests/*.test.mjs` en cada PR hacia `main`. Revisar que el workflow **PR tests** termine correctamente.
- Corregir los problemas en la misma rama; cada push actualiza el preview y vuelve a ejecutar los checks.
- Una vez validado el preview, los tests y cualquier migración necesaria, aprobar y mergear el PR. El merge a `main` dispara el despliegue de producción según la configuración de Netlify.

**Importante:** el preview no reemplaza las pruebas de backend. Las operaciones que dependan de Supabase deben probarse contra staging. Nunca usar un preview para ejecutar pruebas destructivas sobre producción.

## Ejecución local

```bash
node --test tests/*.test.mjs
```

## 9. Pendientes y limitaciones conocidas

Estos puntos **bloquean o condicionan producción**. Están documentados para que nadie los pase por alto.

1. **El rol se toma de la metadata del registro.** Cualquiera con la anon key puede llamar a `signUp` con `rol: 'e'`. Solución propuesta: asignar el rol de empresa desde el servidor (verificación manual o función protegida).
2. **Datos históricos de staging.** El frontend ya no contiene ofertas ni perfiles ficticios y `freshState()` comienza vacío. El proyecto de staging conserva registros históricos de pruebas que no fueron borrados; revisar su origen antes de depurarlos.
3. **Esquema heredado de chats.** Staging conserva las columnas `mensajes.de` y `mensajes.chat_key` por compatibilidad con registros históricos. El frontend actual trabaja con las conversaciones reales vinculadas a `chats` y `mensajes.chat_id`.
4. **Contraseñas filtradas y CAPTCHA.** La protección contra contraseñas filtradas requiere plan Pro. Mientras tanto, la longitud mínima de contraseña se controla en el cliente (8 caracteres) y puede subirse en Auth.
5. **SMTP de Supabase.** Tiene límites bajos. Antes de escalar, usar un proveedor propio.
6. **Mensajes de error reveladores.** "Ya existe una cuenta con ese correo" permite averiguar qué correos están registrados. Es una decisión de producto; debería ser un mensaje genérico.
7. **Correo no editable desde la app.** Los datos de "Datos personales" (candidato) y "Datos empresariales" (empresa) se editan todos, salvo el correo, que es el usuario de acceso. Cambiarlo requiere el flujo de cambio de correo de Auth, que todavía no está implementado.
8. **Notificaciones.** Las notificaciones del candidato no se persisten en una tabla; son estado de UI. El frontend no precarga notificaciones ficticias.
9. **El CV se sube solo con sesión.** Si el registro requiere confirmar el correo, el archivo elegido en el paso 5 no se puede guardar; el usuario tiene que subirlo después desde "Datos personales".
10. **Pruebas automatizadas parciales.** `tests/real-user-offers.test.mjs` verifica que el estado inicial esté vacío y que las ofertas se carguen desde Supabase. Ejecutar con `node --test tests/real-user-offers.test.mjs`. El resto de los flujos sigue requiriendo el checklist manual de la sección 10.
11. **Interacciones reales.** Se eliminaron las respuestas automáticas y las transiciones simuladas de postulaciones. Los mensajes y cambios de estado deben originarse en acciones reales de los usuarios.
12. **Métodos heredados.** `DB.setCupo` y `DB.setTasa` son no-ops; la app ya no escribe esos valores desde el cliente.
13. **Columnas heredadas en staging.** `mensajes.de` y `mensajes.chat_key` siguen en staging por compatibilidad con registros históricos del esquema anterior. No se replican en producción.

---

---

## 10. Checklist de prueba manual

Antes de mergear a `main` o de publicar en producción, probar en **staging** con dos cuentas reales (una empresa y un candidato):

**Ausencia de datos ficticios**
- [ ] La pantalla de login no ofrece accesos de demostración.
- [ ] Sin una sesión autenticada, las rutas privadas redirigen al login.
- [ ] Una cuenta nueva comienza sin ofertas, postulaciones, chats ni notificaciones precargadas.

**Registro y acceso**
- [ ] "Busco trabajo" con datos inválidos: botones deshabilitados, aviso visible.
- [ ] Registro completo de candidato con un correo real. Llega el correo, se confirma, entra al feed.
- [ ] En la base, `perfiles` tiene la fila con `rol`, `nombre` y `datos`.
- [ ] Volver atrás en el registro conserva los datos escritos.
- [ ] Nombre con números o símbolos: se rechaza. Nombre con ñ, ç, acentos: se acepta.
- [ ] Paso 1 con correo o contraseña distintos a los de "Busco trabajo": no avanza.
- [ ] Login con correo sin confirmar: aparece "Reenviar correo".
- [ ] Recuperación de contraseña: llega el enlace y permite elegir una nueva.
- [ ] Cerrar sesión desde `#/c/salir` y `#/e/salir`: vuelve al login.
- [ ] Logo de la landing: con sesión lleva a la app; sin sesión, a login.
- [ ] Dos cuentas distintas no ven los datos de la otra.

**Candidato**
- [ ] Subir CV desde "Datos personales": aparece el nombre del archivo. Un archivo que no es PDF o pesa más de 5 MB se rechaza.
- [ ] Foto de perfil: se sube y se ve en el encabezado de la landing y en la barra lateral.
- [ ] Cupo: "Me interesa" descuenta una postulación. Con cupo en 0, el botón queda deshabilitado. Una búsqueda no se puede postular dos veces.
- [ ] El estado de la postulación pasa a "Respondida" cuando la empresa responde.
- [ ] "Me interesa" de la empresa con postulación previa abre el chat. "Pidió más información" no lo abre.
- [ ] Chat: los mensajes propios aparecen a la derecha y los de la empresa a la izquierda. El avatar y el nombre de la empresa se ven en la lista y en el encabezado.
- [ ] Notificaciones y mensajes corresponden únicamente a interacciones reales de la cuenta.

**Empresa**
- [ ] Publicar una búsqueda: aparece en el panel y en la lista de búsquedas.
- [ ] Con dos o más búsquedas, el selector de candidatos filtra por búsqueda y los contadores coinciden.
- [ ] Responder "Me interesa" a un candidato: se abre el chat con el candidato, y el mensaje de bienvenida aparece con autor propio.
- [ ] Responder "No avanza": el candidato ve "Respondida" y no hay chat.
- [ ] Tasa de respuesta: sube al responder y llega a 100 % cuando no quedan pendientes.
- [ ] Ver CV desde el perfil de un postulante con postulación: abre el PDF. Un postulante sin postulación a una búsqueda propia no se puede abrir.

**Tiempo real**
- [ ] Dos sesiones reales: un mensaje enviado por una parte aparece en la otra sin recargar.

**Consola**
- [ ] Sin errores de Supabase ni del navegador. Los errores de permisos (`permission denied`) indican un `grant` faltante en la migración correspondiente.

---