## 11. Reglas para agentes de IA

Si sos un agente que trabaja en este repo, seguí estas reglas:

1. **Nunca pongas una `service_role` key en el código ni en el repo.** La anon key sí es pública y ya está en `index.html`.
2. **No edites `vendor/supabase.js`.** Si hace falta otra versión, se reemplaza el archivo completo y se actualiza la versión en esta documentación.
3. **No apliques migraciones destructivas** (como la 002) ni la 003 sobre una base con datos que alguien quiera conservar. Preguntá primero.
4. **Toda escritura a la base pasa por `persistir()`**, así los errores llegan a la UI. No llames a `sb.from(...)` directo desde la UI, salvo en las funciones de `DB` o de Storage ya existentes.
5. **No llames a `sb.*` dentro de un callback de `onAuthStateChange` sin `setTimeout`.** Ya está resuelto en el código: no lo reviertas.
6. **Respetá la validación de campos** descrita en la sección 7. Si agregás un campo, definí sus reglas.
7. **Los textos de la interfaz van en español rioplatense**, con voseo.
8. **Cualquier cambio de esquema va en una migración nueva**, numerada a partir de `012`. Nunca edites una migración ya aplicada.
9. **Permisos explícitos.** Toda tabla nueva necesita `grant` explícito para `authenticated`, y RLS activo. No asumas que la plataforma los da.
10. **Nunca dejes que el cliente escriba `cupo`, `tasa` ni `rol`.** Esos valores los calcula el servidor.
11. **Después de cambiar `index.html`, validá la sintaxis** de cada `<script>` (por ejemplo con `node --check` sobre el contenido extraído).
12. **No reintroduzcas datos ficticios en `freshState()` ni accesos que permitan navegar sin una sesión autenticada.**
13. **No reutilices las claves `c:<oferta>` / `e:<candidato>` para un chat real nuevo.** Las conversaciones reales usan `chats` y `mensajes.chat_id`.
14. **No reintroduzcas respuestas automáticas simuladas.** `sendChat()` debe guardar el mensaje escrito por el usuario; las respuestas deben venir de acciones reales de la otra cuenta.
15. **Al modificar `hidratar()`, cargá los datos desde Supabase sin mezclarlos con datos de muestra.** `freshState()` debe seguir vacío.
16. **No cambies la selección de entorno** (`HOSTS_PRODUCCION`) sin confirmación: decide a qué base se conecta cada dominio.
17. **Antes de cambiar la lógica de autenticación**, revisá la sección 7 completa: los pasos de registro, confirmación y login están conectados entre sí.

---