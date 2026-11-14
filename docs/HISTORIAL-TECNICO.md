## 13. Readaptación de landing según nuevo diseño (noviembre 2026)

Referencia visual: archivo **`Match Empleos Landing (copia).pdf`** entregado por diseño. La implementación se realizó en `index.html`, dentro del HTML estático de `#root`. No se modificó el router, la autenticación, Supabase ni las pantallas internas de la aplicación.

### Cambios aplicados

- [x] Encabezado simplificado con marca a la izquierda y accesos de inicio de sesión / registro a la derecha.
- [x] Hero azul con título “Bienvenido a Match Empleos”, bajada y llamada a deslizar.
- [x] Sección “¿Quiénes somos?” con fotografía de fondo, overlay azul y composición alineada a la derecha.
- [x] Sección “Situación actual en Argentina” con tres indicadores y recurso ilustrado.
- [x] Sección “¿Cómo funciona?” reorganizada en dos tarjetas: Perfil Postulante y Perfil Empresa.
- [x] CTA final con ilustración, frase de marca y accesos diferenciados de registro para candidato y empresa.
- [x] Footer verde con redes, contacto, navegación y leyenda institucional.
- [x] Reglas responsive para desktop y mobile.
- [x] Estilos nuevos aislados bajo `.landing-v2` para evitar afectar las pantallas de la aplicación.
- [x] Se preservaron los destinos existentes del router: `#/login`, `#/registro/c/1`, `#/registro/e/1`, páginas legales y navegación por anclas.

### Discrepancias y validaciones pendientes con diseño / producto

1. **Cupo de postulaciones:** producto confirmó cinco postulaciones por semana. La lógica del servidor renueva el cupo los lunes a las 00:00 de Buenos Aires; la landing debe comunicar “5 postulaciones por semana”.
2. **Obligación de respuesta:** el PDF afirma que la empresa “está obligada a responderte”. La aplicación calcula y muestra una tasa de respuesta, pero no se identificó una regla técnica que obligue a responder dentro de un plazo ni una consecuencia por no hacerlo. Producto debe confirmar si es una promesa/compromiso operativo o si debe reformularse el texto.
3. **Perfiles verificados:** las tarjetas hablan de perfiles “verificados”. La documentación actual registra perfiles y roles, pero también señala que la asignación del rol empresa todavía puede iniciarse desde metadata del registro. Confirmar qué significa “verificado” y qué proceso lo respalda antes de presentar esa afirmación como una verificación efectiva.
4. **Estadísticas:** se conservaron los valores del diseño: 16,5%, 43%, 45% y 0,17%, además de los textos asociados. Falta confirmar fuente, período, universo y redacción exacta de cada indicador. En particular, validar la relación “1.500 inserciones sobre 900.000 beneficiarios” y el dato de ghosting de generación Z.
5. **Red social secundaria:** el PDF muestra `@matchempleos` junto a un ícono de video, pero no identifica de forma inequívoca la plataforma ni su URL. En la landing quedó como texto no enlazado hasta recibir el enlace oficial.
6. **Fotografía de “Situación actual”:** el PDF muestra una imagen de multitud teñida de verde. Ese recurso no está entre los 19 archivos de imagen del repositorio. `foto-como.jpg` es una escena de personas trabajando frente a una computadora y no corresponde a esa referencia; no debe usarse como sustituto. Hasta recibir el export correcto, el bloque utiliza únicamente una base verde.
7. **Curvas, recortes y proporciones:** se ajustaron alturas, anchos, escalas tipográficas y transiciones curvas para acercarse a la composición del PDF. Aun así, CSS no garantiza una réplica exacta del arte exportado; requiere captura en navegador y comparación a escala desktop y mobile.
8. **Copy institucional:** se tomó el texto visible en el PDF. Confirmar si “equipo de cinco estudiantes” y la leyenda de Premios OBRAR Estudiantes 2026 siguen vigentes para la publicación pública.

### Criterio para próximas iteraciones

- Mantener la landing estática dentro de `#root` como única fuente de textos y estructura.
- No alterar pantallas autenticadas ni lógica de negocio al retocar estilos de la landing.
- Registrar aquí cualquier diferencia entre promesas de comunicación, reglas reales del producto y comportamiento implementado.
- Antes de publicar, revisar los puntos anteriores con diseño y producto y validar responsive, enlaces de registro, navegación del footer y consola del navegador.

---

## 14. Ajuste de fidelidad visual de landing (noviembre 2026)

Segunda iteración sobre la referencia **`Match Empleos Landing (copia).pdf`**, en la rama `design/landing-fidelidad-pdf`.

### Correcciones aplicadas
- [x] Se amplió el contenedor principal para acercarlo al ancho útil del diseño original.
- [x] Se recuperó la escala tipográfica de los titulares, las tarjetas de perfiles, las métricas y el pie de página.
- [x] Se ajustaron los colores principales a los valores muestreados del PDF: azul `#002146`, verde `#38F48C` y gris `#E8E8E8`.
- [x] Se evitó reutilizar `foto-quienes.jpg` o `foto-como.jpg` como si fueran la fotografía de multitud del bloque estadístico: no corresponden al diseño.
- [x] El bloque de estadísticas utiliza una base verde temporal, sin una fotografía de fondo incorrecta.
- [x] Se incorporaron transiciones curvas para la salida del hero, el bloque de estadísticas, “Cómo funciona” y el CTA.
- [x] Se aumentaron las alturas de las secciones y tarjetas para evitar que la landing quede visualmente comprimida frente al PDF.
- [x] Se mantuvo el responsive para tablet y mobile y se preservaron rutas, anclas y lógica de la aplicación.

### Control pendiente
- [ ] Incorporar el export exacto de la fotografía de multitud que aparece en “Situación actual” y ajustar su encuadre/tinte al PDF.
- [ ] Generar capturas del navegador a 1568 px de ancho y en mobile, y compararlas con el PDF. La actualización se validó a nivel de estructura del CSS y referencias de assets; no se ejecutó una prueba visual con navegador en esta sesión.
- [ ] Revisar la curva inferior de “Situación actual” y la continuidad visual entre la ilustración de “Cómo funciona” y el panel del CTA.

---

---

## 15. Auditoría previa a producción (11 de noviembre de 2026)

**Resultado: NO APTO PARA MERGE / PUBLICACIÓN.** Esta revisión fue estática y de configuración remota; no reemplaza la prueba funcional completa en navegador con cuentas reales.

### Estado del código y repositorios

- [x] test-empleos/main contiene la versión actual de la aplicación y la landing rediseñada.
- [x] Se verificó que los cuatro bloques script ejecutables de index.html compilan sintácticamente. Esto no demuestra que todos los flujos funcionen en ejecución.
- [x] La selección de entorno del frontend apunta a staging para hosts de prueba y a producción solo para matchempleos.com.ar y www.matchempleos.com.ar.
- [x] Se eliminó el modo de acceso sin autenticación y los datos ficticios del frontend. No se borraron datos históricos de staging.
- [ ] Ejecutar node --test tests/real-user-offers.test.mjs en un entorno Node y registrar el resultado. La existencia del test no equivale a una ejecución aprobada.
- [ ] Completar el checklist manual de la sección 10 con dos cuentas reales y validar los flujos de registro, recuperación, postulaciones, respuestas, chat, CV, Storage y Realtime.
- [ ] Comparar visualmente la landing en navegador desktop y mobile contra el diseño aprobado.
- [ ] Revisar el diff completo del pull request entre Alternativy/test-empleos:main y Alternativy/MatchEmpleos:main antes de aprobarlo. Los repositorios tienen historiales y contenidos distintos; no asumir que una sincronización previa equivale al estado actual.

### Animaciones de la landing: implementación no aprobada

Las animaciones de scroll **no se pudieron implementar de manera correcta**. En index.html hay reglas CSS, atributos data-reveal y un IntersectionObserver, pero la presencia de ese código no significa que el resultado visual cumpla lo pedido. No se consideran terminadas ni aprobadas para producción.

- [ ] Rehacer o corregir las entradas al viewport y comprobarlas visualmente en desktop y mobile.
- [ ] Verificar las direcciones solicitadas: llamada a deslizar desde la izquierda; texto de “Quiénes somos” desde abajo; encabezado de “Situación actual” desde la izquierda; bloques porcentuales desde la derecha; tarjetas de perfiles con una entrada sutil.
- [ ] Comprobar que las animaciones no se reinicien incorrectamente al renderizar, navegar o recuperar una sesión.
- [ ] Mantener el comportamiento accesible para prefers-reduced-motion.

### Verificación de Supabase

Se inspeccionaron los proyectos remotos identificados en la sección 8:

| Control | Staging | Producción |
|---|---|---|
| Estado del proyecto | ACTIVE_HEALTHY | ACTIVE_HEALTHY |
| Migración más reciente registrada | 011_pausar_busquedas | 011_pausar_busquedas |
| RLS en tablas públicas inspeccionadas | Activo | Activo |
| Bucket avatars | Público, 2 MB, JPG/PNG/WEBP | Público, 2 MB, JPG/PNG/WEBP |
| Bucket cvs | Privado, 5 MB, PDF | Privado, 5 MB, PDF |

La estructura observada en producción incluye las tablas y columnas principales usadas por la versión actual. Las migraciones registradas en producción siguen su historial consolidado (000, 000b, 000c, 008, 010, 011); staging conserva su historial incremental. Ambos proyectos tienen registradas las migraciones funcionales hasta la 011.

### Bloqueantes y advertencias que siguen abiertos

1. **Asignación del rol empresa — bloqueante de seguridad/producto.** El flujo de registro envía rol dentro de user_metadata y el trigger de creación de perfil utiliza esos datos. Un usuario puede solicitar el rol de empresa desde el cliente. Antes de habilitar el registro público, definir y aplicar una asignación/verificación del rol desde un mecanismo confiable del servidor y revisar las políticas RLS que dependen de ese rol.
2. **Configuración de Auth en producción — pendiente de comprobación operativa.** Confirmar Site URL y Redirect URLs exactas, confirmación de correo, plantillas en español y flujo de recuperación desde el dominio definitivo. La inspección de base de datos no acredita esta configuración del dashboard.
3. **SMTP y entregabilidad — pendiente.** La documentación de producto indica que se utiliza el SMTP compartido de Supabase, con límites bajos. Verificar el proveedor, SPF, DKIM, DMARC, remitente y entrega real antes de abrir el registro al público.
4. **Protección de contraseñas filtradas — advertencia activa.** El advisor de Supabase reporta deshabilitada la protección contra contraseñas comprometidas en ambos proyectos.
5. **Funciones SECURITY DEFINER — revisar, no revocar a ciegas.** Los advisors detectan que borrar_busqueda, cupo_actual y postular son ejecutables por authenticated. El cliente necesita invocar las RPC correspondientes, por lo que hay que verificar sus comprobaciones internas de identidad/propiedad y sus permisos; no quitar EXECUTE sin revisar el flujo.
6. **Rendimiento — mejoras recomendadas.** Los advisors señalan claves foráneas sin índices de cobertura, expresiones de Auth que se reevalúan en políticas RLS y políticas permisivas múltiples. No se detectó una falla funcional derivada de estos avisos, pero conviene corregirlos antes de escalar.
7. **Copy y promesas públicas — pendiente parcial.** El cupo quedó definido en cinco postulaciones por semana. Siguen pendientes la obligación de respuesta, el alcance de “perfiles verificados” y las fuentes/períodos de las estadísticas. No publicar promesas que el comportamiento actual no respalde.
8. **SEO y recursos de publicación — pendiente.** Completar Search Console, imagen social definitiva, manifest corregido y URLs independientes para páginas legales, según la sección 12.

### Decisión de publicación

No abrir todavía el pull request de producción ni hacer merge. Primero resolver los bloqueantes de seguridad y configuración, corregir las animaciones, completar las pruebas manuales y validar el diff entre ambos repositorios. Una vez cumplidos esos puntos, volver a comparar test-empleos/main con MatchEmpleos/main y abrir el pull request para revisión; este documento debe actualizarse con los resultados de esa nueva validación.

---

## 14. Verificaciones y pendientes de login e IA (12/11/2026)

- Login: inspección estática de `login()`, `iniciarSesionForm()`, `setSesion()` y `route()`. Se verificó validación de correo/contraseña, llamada a Supabase Auth, consulta de `perfiles`, protección de rutas privadas y redirección por rol. Los scripts JavaScript ejecutables del HTML pasaron el chequeo de sintaxis. No se probó una sesión real porque esta revisión no contó con credenciales de prueba ni ejecución del sitio en navegador.
- Manejo de errores del login: `iniciarSesionForm()` distingue credenciales incorrectas y correo sin confirmar y restablece el botón en `finally`. En el código actual no hay `catch` para excepciones inesperadas de red; agregarlo y probarlo es pendiente.
- UX/UI del login: pendiente una revisión específica de diseño responsive, jerarquía, accesibilidad, textos y estados de error/carga.
- IA: la Edge Function `mejorar-sobre` está activa en producción y staging. El frontend quedó habilitado en ambos entornos. Producción tiene las RPC y tablas de cuotas; falta una prueba funcional real desde el dominio productivo y confirmar que al menos una clave de proveedor (`GEMINI_API_KEY` o `GROQ_API_KEY`) esté configurada y operativa. Las cuotas de IA son independientes del cupo de postulaciones.
- UX/UI de IA: pendiente mejorar el flujo de propuesta, comparación, aplicación y mensajes de disponibilidad/límite.


---

---

## 16. Estado real del repositorio verificado (12 de noviembre de 2026)

Esta sección prevalece sobre descripciones anteriores cuando haya contradicciones. Se contrastó el contenido de `main`, especialmente `index.html`, con los archivos de funciones y SQL presentes en el repositorio. No equivale a una prueba funcional en navegador ni a una auditoría de los proyectos remotos de Supabase.

### Referencia de versión

- Repositorio de trabajo: `Alternativy/test-empleos`.
- Rama revisada: `main`.
- HEAD previo documentado: `1b735ba9963df6fc9d92eed4ed5efcb8715eb4b6` — `Cambia ilustración principal por seniala-celular`. Verificar el HEAD de `main` antes de usar esta referencia.
- Archivo principal del frontend: `index.html`. No hay proceso de build ni gestor de paquetes para la app.
- No editar `Alternativy/MatchEmpleos` ni el proyecto Supabase de producción como parte del flujo habitual de desarrollo.

### Cambios recientes confirmados en el código

- **Ilustración principal:** la landing utiliza `img/seniala-celular.png`. Se actualizaron las cuatro referencias en `index.html`: Open Graph, Twitter Card, imagen del SVG/landing y `img.lp-hero-art`. El archivo existe en `img/`. Ya no debe documentarse `ilus-hero.png` como imagen activa del hero.
- **Recuperación de contraseña:** se quitó el mensaje en pasado que afirmaba que el correo ya había sido enviado antes de pulsar “Enviar”. El formulario conserva el texto introductorio en futuro, llama a `recuperarForm()` y luego muestra un aviso genérico. No se probó la entrega real del correo.
- **Login:** el formulario está conectado a `iniciarSesionForm()`, valida los campos, llama a `sb.auth.signInWithPassword`, contempla correo sin confirmar y credenciales incorrectas, y restablece el botón en `finally`. El código actual no incluye un `catch` para errores inesperados de red. La UX/UI sigue pendiente y no hay prueba E2E con cuentas reales.
- **Animaciones de landing:** el código actual contiene `lp-reveal` e `IntersectionObserver`. Su existencia no demuestra que las animaciones cumplan la dirección, tiempos y comportamiento solicitados. La validación visual desktop/mobile sigue pendiente; consultar la auditoría de la sección 15.
- **Datos de la aplicación:** el estado inicial está vacío y la interfaz se hidrata con datos de Supabase. No se incluyen publicaciones, postulaciones, perfiles ni chats de muestra.

### Funcionalidades cuya documentación histórica no coincide con el frontend actual

Los siguientes puntos son importantes: existen commits o archivos de backend/SQL relacionados, pero **no están conectados al frontend de `main` en la versión inspeccionada**. No presentarlos como funcionalidades disponibles para usuarios.

1. **Mejorar “Sobre vos” con IA:** existe `supabase/functions/mejorar-sobre/index.ts`, con validación de texto, autenticación, reservas de cuota y proveedores Gemini/Groq. Sin embargo, el `index.html` actual no contiene el botón, no llama a `sb.functions.invoke` ni referencia `mejorar-sobre`. La integración visible del frontend debe considerarse pendiente. Tampoco se verificó en esta revisión el despliegue de la función, los secretos ni las cuotas remotas.
2. **Sugerencias de respuesta para chats:** existe `supabase/functions/sugerir-respuestas-chat/index.ts`. El frontend actual no invoca esa función. No afirmar que la asistencia IA en chats está activa.
3. **Límite anónimo de IA:** existe `supabase/sql/anonymous_sobre_ai_single_use.sql`, que define almacenamiento privado y RPC para reservar/completar un único uso anónimo. El frontend actual no envía `anonymousId` ni llama a la Edge Function; el límite no está integrado de punta a punta.
4. **Denuncias y verificación de empresas:** existe `supabase/sql/denuncias_y_verificacion_empresas.sql`, con tablas para denuncias, empresas verificadas y revisiones internas, más políticas RLS. El `index.html` actual no contiene botón “Denunciar”, formulario de motivos, consulta de estado verificado ni insignia de empresa verificada. El archivo SQL no es una migración numerada; su comentario indica que fue aplicado en el proyecto de testing, pero esa aplicación remota no se verificó en esta revisión. Confirmar el estado real en staging antes de modificar o volver a ejecutar el SQL.
5. **Persistencia del registro:** los commits históricos `f506d83` y `3d6bd5b` implementaron borrador local y persistencia de CV, pero el `index.html` actual no contiene las claves `me_registro_borrador_v1` / `me_registro_archivos_v1`, ni uso de localStorage o IndexedDB. Hoy `regDraft`, `S.reg` y `regCvFile` son estado en memoria. La persistencia tras refrescar debe reimplementarse o recuperarse y volver a verificarse antes de darla por terminada.

### Pendientes prioritarios

- [ ] Reintegrar y probar la persistencia del registro y del CV, sin guardar contraseñas en almacenamiento local.
- [ ] Reintegrar el flujo de “Mejorar con IA” en los campos previstos, incluyendo reserva/consumo de cuota solo tras respuesta exitosa, manejo de fallos y límites tanto autenticados como anónimos.
- [ ] Verificar despliegue y secretos de `mejorar-sobre` y `sugerir-respuestas-chat` en staging; no asumir que los archivos fuente están desplegados.
- [ ] Implementar en frontend el botón naranja “Denunciar”, el panel de motivos, el envío vinculado a la postulación/chat y la presentación del estado de verificación de empresa. Revisar primero el esquema y las políticas ya existentes en Supabase staging.
- [ ] Resolver el manejo de excepciones inesperadas en `iniciarSesionForm()` y `recuperarForm()`; probar credenciales incorrectas, correo sin confirmar, errores de red, sesión persistente, recuperación, cambio de contraseña, cierre de sesión y redirección por rol.
- [ ] Completar la revisión UX/UI responsive del login y de los flujos de IA.
- [ ] Probar las animaciones de scroll con navegador real, desktop y mobile, incluyendo `prefers-reduced-motion`.
- [x] El frontend parte de estado vacío, exige sesión autenticada y carga publicaciones, postulaciones y chats desde Supabase. Pendiente validar los recorridos completos con dos cuentas reales.
- [ ] Antes de producción, resolver los bloqueantes de seguridad y configuración documentados en la sección 15 y comparar el diff completo con el repositorio de producción.

### Reglas para agentes de IA que retomen el trabajo

- Leer esta sección y verificar el HEAD de `main` antes de asumir que una funcionalidad documentada en otra sección sigue implementada.
- Distinguir siempre entre: archivo fuente presente, función desplegada en Supabase, integración activa en frontend y prueba funcional completada. Son cuatro estados diferentes.
- No volver a ejecutar scripts SQL existentes a ciegas. Inspeccionar primero tablas, funciones, políticas y migraciones del proyecto staging.
- Trabajar en `Alternativy/test-empleos` y Supabase staging. Producción requiere autorización explícita.
- Después de cada cambio, informar archivos, commit, validaciones realmente ejecutadas y pruebas que siguen pendientes. No llamar “verificado” a un flujo que solo pasó una inspección estática.

---

## 17. Limpieza de datos ficticios (12 de noviembre de 2026)

- Se eliminó el acceso sin autenticación y toda la lógica de sesión local que permitía navegar sin una cuenta de Supabase.
- `freshState()` inicia con ofertas, postulaciones, búsquedas, candidatos, chats y notificaciones vacíos.
- `hidratar()` asigna las ofertas y publicaciones obtenidas de Supabase; no mezcla resultados con registros locales de muestra.
- `apply()` exige `real === true` y utiliza `DB.postular()`. Se quitaron los estados automáticos “Vista”/“Respondida” y los mensajes ficticios temporizados.
- `sendChat()` solo persiste el texto que escribió el usuario. Los mensajes de la otra cuenta deben llegar desde Supabase/Realtime.
- `enviarResp()` abre un chat únicamente cuando la empresa selecciona “Me interesa”; ya no crea respuestas o conversaciones ficticias.
- No se borraron usuarios, búsquedas, postulaciones, chats ni mensajes de las bases de staging o producción. Tampoco se modificaron esquemas ni políticas remotas.
- Cambios en `index.html`: `679ef35`, `561e091`, `10cb03d`, `074c77a`, `48fcf11`, `7b37f1e`, `f938402` y `f15e4c1`. También se eliminaron los recursos sin uso `img/logo-cafe-mercado.png`, `img/avatar-tomas.png` e `img/oferta-cafe.jpg` en los commits `6418f24`, `a460e82` y `45e541b`. La documentación se actualizó en `83c6c55`, `2063a81` y esta actualización.
- Verificación pendiente: ejecutar `node --test tests/real-user-offers.test.mjs` y realizar pruebas manuales con una cuenta candidata y una empresa reales. No se declara validación E2E.

---

## 18. Corrección del cupo semanal en el panel de postulante (12 de noviembre de 2026)

- `DB.cargar()` ejecutaba `cupo_actual()` en la rama de empresa, pero no en la rama de postulante. Como `freshState()` inicializa `S.c.cupo` en `0`, la hidratación del candidato nunca reemplazaba ese valor y el botón “Me interesa” quedaba desactivado aunque Supabase tuviera cupo disponible.
- Se trasladó la llamada RPC `cupo_actual()` a la rama de postulante y se devuelve `cupo` en el objeto de datos que consume `hidratar()`. La empresa ya no ejecuta una RPC que no necesita.
- El cupo sigue siendo calculado y validado por Supabase; `postular()` continúa siendo la autoridad final y descuenta el cupo en servidor.
- Inspección de staging: los perfiles candidatos consultados tenían `cupo = 5`; no había postulaciones de esta semana y solo una postulación histórica en el conjunto consultado. No se modificaron datos ni funciones SQL.
- Commit frontend: `0e5570715319e4ab4f42f31890f2009b968b7c20`.
- Verificación realizada: relectura del archivo desde `main` y comprobación estática de que la rama candidata llama a `cupo_actual()`, devuelve `cupo` y `hidratar()` lo asigna a `S.c.cupo`. Pendiente: probar el login y la postulación desde navegador con una cuenta candidata real.

---

## 19. Mensajes no leídos y denuncias desde el frontend (12 de noviembre de 2026)

- El contador de navegación ahora contempla mensajes entrantes no leídos en el ítem «Mensajes» para postulantes y empresas. Los INSERT recibidos por Realtime actualizan la conversación y el contador; al abrir el chat se marca como leído.
- Como la tabla `mensajes` no tiene una columna de lectura por usuario, el último ID leído por chat se guarda en `localStorage`, separado por usuario autenticado. Al inicializarse por primera vez, los mensajes históricos existentes se consideran leídos; los mensajes entrantes posteriores generan el contador. La lectura no se sincroniza entre dispositivos/navegadores.
- Se conectó el botón naranja «⚑ Denunciar» en las tarjetas de postulaciones del postulante y dentro de sus chats. El formulario envía motivo, detalle y mensaje a `public.denuncias`, vinculando denunciante, postulación, empresa y, cuando corresponde, chat. Se usan los motivos permitidos por el CHECK constraint actual.
- El backend de testing ya tenía `public.denuncias`, RLS activado y una política INSERT que exige que la postulación y la empresa correspondan al postulante autenticado; no se modificaron esquema, políticas ni datos. No había interfaz ni inserción desde el frontend, por eso la funcionalidad no aparecía.
- El botón en una tarjeta requiere que el frontend pueda resolver el ID de empresa desde una búsqueda activa o desde un chat asociado. Para postulaciones históricas sin búsqueda visible ni chat, la política RLS actual puede impedir resolver/registrar la denuncia desde el frontend; no se amplió el acceso a búsquedas inactivas para evitar reintroducir dependencias RLS circulares.
- Commits frontend: `0f82283e247a79f40d92fd5dc3f4631da3cdd0cf`, `026546bdd0071a323a81df5f03e367ae5f8b2c20`, `3c152f778b00a9951dfde84452d3d2f167c63c19` y `5f8534a5c57e9032596b4cda51d646a5f80bcfb6`.
- Validación realizada: inspección de columnas, claves foráneas, RLS y política INSERT de `denuncias` en Supabase testing; relectura de `index.html` desde `main` y comprobación de que están conectados el listener Realtime, el contador de navegación, el formulario y la inserción. No se ejecutó una prueba E2E ni se creó una denuncia ficticia.

---

## 20. Corrección del feed y del contador de mensajes no leídos (12 de noviembre de 2026)

- El feed de postulante excluye las búsquedas cuyo `oferta_id` ya figura en las postulaciones devueltas por Supabase. Se conserva la posición del feed al actualizarlo y se ajusta si la oferta visible deja de estar disponible.
- El contador «Mensajes» ahora conserva los IDs de mensajes entrantes no leídos, suma también los mensajes cuyo chat todavía no se hidrató en el estado local y no marca automáticamente como leídos los mensajes recibidos mientras el usuario estaba desconectado. Abrir el chat actualiza el marcador local y limpia su contador.
- Los marcadores siguen almacenándose en `localStorage`; no se agregó una columna de lectura ni sincronización entre dispositivos. Al no existir marcador previo, los mensajes entrantes históricos visibles pueden aparecer como no leídos la primera vez; se limpian al abrir la conversación.
- Se verificó que `mensajes` y `chats` están en la publicación `supabase_realtime`, que las políticas SELECT de `mensajes` permiten a los participantes leer sus conversaciones y que los logs recientes registran conexiones WebSocket y escrituras HTTP 201. Esto confirma la infraestructura de Realtime y la persistencia, pero no sustituye una prueba visual E2E del badge.
- La función «Mejorar sobre mí» permanece en la rama `Implementar-IA`; no está integrada en `main`. La Edge Function `mejorar-sobre` sigue activa en Supabase testing (versión 19). La UI de registro/edición y sus manejadores no forman parte del HTML de `main`; no se fusionó la rama completa para evitar sobrescribir correcciones posteriores del proyecto.
- Commits frontend de esta corrección: `7b2bb6b993409b1c8b414394b37ffaec5d902f2b` y `a8ffdbfeb514c7626a1e5ed000bfb5823e605d13`.
- Verificación realizada: relectura del archivo desde `main` y comprobaciones estáticas de filtrado de ofertas, marcadores de lectura, contador global y manejo de chats no hidratados. Pendiente: probar con dos sesiones reales que una postulación desaparezca del feed y que un mensaje recibido con la sesión cerrada genere el badge al volver a entrar.

---

## 21. Mejora del campo «Sobre vos» con IA (12 de noviembre de 2026)

- Se integró en el frontend la Edge Function existente `mejorar-sobre`, sin modificar ni desplegar el backend.
- Disponible en staging para postulantes y empresas, tanto durante el registro como en la edición del perfil:
  - Postulante: `rc-sobre` (registro) y `ed-sobre` (edición).
  - Empresa: `re-desc` (registro) y `ede-desc` (edición).
- El usuario debe escribir una descripción de hasta 4.000 caracteres. La IA devuelve una propuesta editable; el texto original no se reemplaza hasta pulsar «Usar esta versión». Si el texto original cambia después de generar la propuesta, no se permite aplicar una sugerencia desactualizada.
- Al aplicar una propuesta durante la edición del perfil, se actualiza el textarea y se marca el campo como mejorado en `ME.datos.ai`; el cambio queda persistido al guardar el perfil. En registro, se actualiza el borrador local del campo.
- Se envía un identificador UUID anónimo persistido en el navegador para permitir la mejora gratuita previa al registro. Para usuarios autenticados, el backend valida la sesión y aplica sus cuotas por cuenta. El frontend muestra el límite informado por el servicio; la validación y reserva de uso siguen del lado servidor.
- Límites definidos por el backend: 5 mejoras por día y 50 por mes para cuentas autenticadas; una mejora gratuita por navegador para visitantes. Se conserva el guard de entorno: la interfaz se muestra en staging, no en producción.
- Se verificó en Supabase testing que `mejorar-sobre` está ACTIVE (versión 19), con validación manual de sesión, y que existen los RPC de reserva/cierre de cuotas para usuarios y visitantes. No se cambió la Edge Function, las claves ni las tablas.
- Verificación frontend: relectura de `index.html` desde `main` y comprobaciones estáticas de los cuatro puntos de entrada, invocación de la función, envío del identificador anónimo, aplicación condicionada a que el original no haya cambiado y persistencia de las marcas por tipo de perfil. Pendiente: prueba interactiva en navegador con cuenta de postulante, cuenta de empresa y visitante anónimo.
- Commit frontend: `5c4c67c74295bc3494a1c8f88fa9e725e8a78256`.

---

## 22. Orden de candidatos por coincidencia con la búsqueda (12 de noviembre de 2026)

- Al abrir «Ver candidatos» desde una publicación, el listado de postulantes que ya se postularon a esa búsqueda se ordena de mayor a menor coincidencia estimada con sus requisitos.
- El puntaje compara jornada y turno seleccionados en la publicación con las preferencias del perfil, y contrasta términos relevantes del puesto y su descripción con el puesto buscado, rubros, experiencia y texto «Sobre vos» del postulante.
- El porcentaje es una heurística local y explicable, no una predicción de contratación ni una evaluación mediante IA. Si la publicación no tiene criterios suficientes, se muestra «Coincidencia no disponible».
- No se incorporan perfiles que no se hayan postulado a la búsqueda. Se conserva el alcance de privacidad vigente: la empresa ve perfiles vinculados a sus propias postulaciones.
- No se modificaron tablas, funciones, políticas RLS ni datos de Supabase. La lógica corre en el frontend sobre los datos que la empresa ya puede consultar.
- Commit frontend: `e5b5ae8bf6b8adfe77e6a35bf9fd49fac1653e4f`.
- Verificación realizada: inspección del cambio en `index.html` y comprobación estática de la función de puntaje, el orden descendente, la inclusión de datos del perfil y la etiqueta de coincidencia. Pendiente: prueba visual con postulaciones reales de perfiles con distintas preferencias y descripciones; no se ejecutó E2E.

---

## 23. Verificación manual de empresas: distintivo visual (12 de noviembre de 2026)

- Se inspeccionó el proyecto Supabase de testing `gtnxlkqumppeintdpycn`. Ya existe una infraestructura parcial para registrar verificaciones:
  - `public.empresas_verificadas`: relación pública entre `empresa_id` y `verified_at`, con lectura permitida a usuarios autenticados.
  - `private.empresa_verificacion_revisiones`: registro privado por empresa con `estado` (default `pendiente`), `notas_internas`, `revisado_por`, `revisado_at`, `created_at` y `updated_at`.
  - `private.sync_empresa_verificada()`: trigger function SECURITY DEFINER que agrega/actualiza la empresa en `public.empresas_verificadas` cuando el estado de revisión es `verificada`, y la quita en los demás estados.
- **Objetivo funcional:** mostrar un tilde de verificado únicamente como distintivo visual de confianza para las empresas que hayan sido verificadas manualmente por el equipo de Match Empleos.
- El distintivo no otorga ventajas ni permisos adicionales. No cambia la visibilidad, prioridad o distribución de las publicaciones, el orden del feed, el matching, las postulaciones ni ninguna otra funcionalidad de la plataforma. No debe interpretarse como una garantía sobre ofertas individuales ni como una evaluación automatizada.
- La aprobación, el rechazo y la revocación corresponden exclusivamente a miembros autorizados del equipo Match Empleos. La empresa no puede solicitar o activar el tilde mediante un campo editable de su perfil ni modificar su estado desde el navegador.
- El estado que consume el frontend debe derivarse de la fuente administrada por backend (por ejemplo, `public.empresas_verificadas` o una vista/función segura). No confiar en un booleano enviado por el cliente ni permitir escrituras directas desde el navegador sobre `empresas_verificadas` o la tabla privada de revisiones.
- La insignia se mostrará junto al nombre de la empresa en los contextos donde se identifica a la organización (perfil, publicaciones, tarjetas y chat), siempre que su verificación manual esté vigente.
- Las restricciones de aprobación y modificación deben aplicarse con RLS, privilegios SQL y/o funciones backend autenticadas. Ocultar controles en el frontend no constituye autorización. Conservar la auditoría mediante `revisado_por`, `revisado_at` y, cuando corresponda, `notas_internas`.
- **Implementación visual en frontend (12 de noviembre de 2026):** `DB.cargar()` consulta `public.empresas_verificadas` para los IDs de empresas asociadas a las búsquedas activas y a los chats del postulante. La interfaz deriva un booleano en memoria (`verificada`) a partir de esos IDs; no agrega una columna editable a `perfiles` ni confía en datos enviados por el navegador.
- El tilde verde con check se muestra junto al nombre de la empresa en la tarjeta del feed, el detalle de la publicación, la pantalla de match y la lista/cabecera del chat del postulante. Tiene texto accesible y tooltip «Empresa verificada». No se muestra a empresas sobre sí mismas ni se agrega un control para solicitar o activar la verificación.
- El distintivo es **exclusivamente estético**: no modifica permisos, acceso, visibilidad, prioridad, distribución, matching, postulaciones ni ninguna otra lógica de negocio. No implica garantía sobre una publicación o contratación.
- La consulta es de solo lectura y depende de que la política SELECT existente permita consultar `public.empresas_verificadas` a usuarios autenticados. No se modificaron tablas, funciones, triggers, políticas, permisos ni datos de Supabase.
- Commits frontend: `d93b8f696213987c579eb3a11908d82e89c55539` (consulta y badge inicial) y `a5b4b5c383d4403967a1ade00824e67df134145f` (badge en match y chats).
- Validación realizada: relectura de `index.html` desde `main` y comprobación estática de la consulta de IDs verificados, el booleano derivado y los puntos de renderizado. No se ejecutó prueba visual/E2E con una empresa verificada real.
- Pendiente: definir el mecanismo seguro para autenticar a los miembros del equipo Match Empleos; auditar políticas y privilegios efectivos; probar en staging la lectura de una empresa verificada y otra no verificada; completar aprobación/rechazo/revocación manual y verificar que una empresa no pueda auto-verificarse ni alterar su estado mediante REST.

---

## 24. Carga de perfiles, campos multi-select y criterios de matching (13 de noviembre de 2026)

### Persistencia y estructura SQL

- El perfil de cada usuario se almacena en `public.perfiles`. Los campos variables del registro se guardan dentro de `perfiles.datos` (`jsonb`, default `{}`), con dos niveles usados por el frontend: `campos` para valores textuales y `chips` para selecciones múltiples.
- Las búsquedas de empresa guardan `jornada` y `turno` en columnas `text[]`, ambas `NOT NULL DEFAULT '{}'`.
- En staging y producción se verificó que las columnas y defaults relevantes de `perfiles` y `busquedas` coinciden. El JSONB interno y los arrays no tienen constraints SQL que validen las claves, los valores permitidos, la cardinalidad o la consistencia entre preferencias de perfil y búsqueda.
- El trigger `on_auth_user_created` ejecuta `handle_new_user()` y crea el perfil a partir de `raw_user_meta_data`. En staging la función valida explícitamente que el rol sea `c` o `e`; en producción esa validación explícita no está en la función, pero el CHECK de `perfiles.rol` restringe los valores admitidos.
- Los permisos de columnas revisados permiten al usuario autenticado actualizar `nombre`, `datos` y `avatar_url`, pero no `rol`, cupo ni métricas del perfil. No se detectó que el cliente pueda cambiar su propio rol mediante el UPDATE ordinario de `perfiles`.

### Comportamiento de los multi-select

- `perfilDatos()` agrupa los textos no vacíos en `campos` y las selecciones de `S.reg.chips` en arrays dentro de `chips`. Ejemplo:
  ```json
  {
    "campos": {"rc-ubi": "Burzaco", "rc-puesto": "Atención al público"},
    "chips": {
      "tipo": ["Full Time"],
      "modo": ["Presencial"],
      "hora": ["Mañana", "Tarde"]
    }
  }
  ```
- Los chips no son obligatorios. Pueden quedar sin selección. En el perfil de postulante, `rubros` permite hasta 3 opciones; `tipo`, `modo` y `hora` no tienen límite adicional en frontend. En el perfil de empresa, `sector`, `etipo`, `eexp`, `emodo` y `ehora` tampoco tienen límite adicional en frontend.
- Durante el registro, `regDraft` y `S.reg.chips` viven en memoria. La navegación interna conserva los valores, pero refrescar la página durante el proceso puede perderlos. No se encontró persistencia local del borrador.
- En edición, el frontend recupera `ME.datos.chips` y vuelve a guardar las selecciones. Una clave puede estar ausente o contener un array vacío; la interfaz trata ambos casos como ninguna selección.
- La primera búsqueda automática de una empresa, creada por `asegurarBusquedaEmpresa()`, transfiere el puesto y la descripción, pero no copia las preferencias `ehora`, `etipo`, `eexp` ni `emodo` del perfil a `busquedas.jornada` y `busquedas.turno`. Esas preferencias del perfil no afectan por sí solas los criterios de la búsqueda inicial.

### Matching actual y decisión pendiente

- `puntajeMatch()` compara `busquedas.jornada` con `postulante.datos.chips.tipo` y `busquedas.turno` con `postulante.datos.chips.hora`. También utiliza términos del puesto, descripción, rubros, experiencia y texto del perfil en el análisis textual.
- El cálculo estructurado de listas mide la intersección del candidato sobre la cantidad de opciones elegidas por la empresa. Por ejemplo, si la empresa selecciona tres turnos y el postulante coincide con uno, ese criterio aporta un tercio; con dos, dos tercios; con los tres, el total. Si la empresa no especifica turnos, el criterio se excluye.
- **Decisión de producto pendiente:** confirmar si las opciones múltiples de jornada y turno de la empresa representan alternativas aceptables (OR: cualquiera de las opciones sirve) o requisitos acumulativos (AND: se espera coincidencia con todas). El cálculo actual se comporta como acumulativo y puede penalizar a una persona que sí cumple una de las alternativas ofrecidas. No cambiar esta semántica sin definirla primero.
- Los chips `modo`, `sector`, `etipo`, `eexp`, `emodo` y `ehora` no participan como comparaciones estructuradas directas en el puntaje actual. En particular, `ehora` del perfil de empresa no se convierte en `busquedas.turno`.

### Guardado de edición y cobertura de pruebas

- Se detectó que `guardarEdicionPerfil()` no comprueba correctamente el resultado de `DB.guardarDatosPerfil()` y puede mostrar un toast de éxito aunque Supabase haya devuelto un error. La persistencia debe comunicar explícitamente éxito/error; no debe usarse `data === null` como criterio único, porque un UPDATE exitoso sin SELECT también puede devolver datos nulos.
- Los tests existentes revisan contratos estáticos del registro, autenticación y carga de ofertas, pero no cubren el ciclo completo de valores multi-select. No se encontraron pruebas para cero, una, varias y todas las opciones; desmarcar todo; guardar y recuperar tras logout/login; editar y volver a cargar; ni transferencia de preferencias del perfil de empresa a la primera búsqueda.
- El análisis incluyó inspección del frontend, los tests disponibles y lectura de esquema/funciones/permisos en staging y producción. **No se modificó código, esquema, políticas ni datos de Supabase en esta revisión.** Los hallazgos son diagnóstico, no una corrección implementada ni una prueba E2E.

### Trabajo recomendado antes de dar el flujo por validado

- [ ] Definir formalmente la semántica OR/AND de las selecciones múltiples de jornada y turno en una búsqueda.
- [ ] Normalizar el guardado de chips para representar consistentemente ninguna selección como array vacío, sin romper compatibilidad con perfiles existentes.
- [ ] Corregir el falso mensaje de éxito de `guardarEdicionPerfil()` y propagar errores reales de persistencia.
- [ ] Resolver cómo las preferencias de empresa deben inicializar `jornada` y `turno` en la primera búsqueda, si corresponde según la definición del producto.
- [ ] Agregar pruebas parametrizadas para cero, una, varias y todas las opciones, desmarcado total, registro, edición, recarga, nueva sesión y matching.
- [ ] Probar el flujo completo en staging con cuentas reales de postulante y empresa; no ejecutar pruebas destructivas sobre producción.