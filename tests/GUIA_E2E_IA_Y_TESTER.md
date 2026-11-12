# Guía E2E – Match Empleos

Esta guía complementa las 18 pruebas estáticas de `real-user-offers.test.mjs`. Esas pruebas inspeccionan contratos del código; **no abren un navegador, no inician sesión en Supabase y no consultan Gemini**. Un E2E debe recorrer la aplicación real en staging y comprobar el resultado observable de principio a fin.

## 1. Preparación común

1. Usar exclusivamente el sitio de pruebas (Deploy Preview o URL de staging) conectado al proyecto Supabase de staging `gtnxlkqumppeintdpycn`. No ejecutar estos casos contra `matchempleos.com.ar` ni contra producción.
2. Confirmar que las Edge Functions necesarias estén desplegadas en staging y que sus secretos `GEMINI_API_KEY` y, si se quiere probar el fallback, `GROQ_API_KEY` estén configurados en Supabase → Edge Functions → Secrets.
3. Crear cuentas de prueba separadas: una persona candidata y una empresa. Usar correos de testing controlados por el equipo. No reutilizar cuentas personales ni datos reales.
4. Preparar textos sintéticos, sin datos personales. Registrar URL, navegador, fecha, usuario de prueba (sin contraseña), resultado esperado y evidencia.
5. Limpiar o identificar los registros creados durante la prueba. No borrar datos históricos compartidos de staging.

## 2. E2E asistido por Gemini Argon

Gemini Argon actúa como agente de QA que opera el navegador (por ejemplo, mediante Playwright o un navegador con control de interfaz). No debe sustituir las aserciones por una lectura del código: debe ejecutar las acciones en la interfaz y observar sus resultados.

### Prompt operativo para el agente

> Actuá como tester E2E de Match Empleos. Trabajá únicamente en la URL de staging que te indique el equipo. No abras el dominio de producción, no cambies configuración, no ejecutes SQL, no borres datos y no muestres ni solicites claves API o contraseñas. Usá solamente las credenciales de cuentas de prueba que te entregue el responsable por un canal seguro. Ejecutá los casos de esta guía en el navegador. Para cada paso informá acción, resultado observado, resultado esperado y PASS/FAIL. Adjuntá capturas o trazas sin incluir credenciales, tokens ni datos personales. Si un paso falla, detenete antes de repetir acciones que puedan crear registros o consumir cuota. No afirmes que Gemini respondió si no observaste una respuesta real en pantalla.

### Caso A – mejora de “Sobre vos” como visitante

1. Abrir el registro de candidato en staging y llegar al campo “Sobre vos”.
2. Ingresar un texto sintético, por ejemplo: “Atendí clientes, organicé mercadería y colaboré con el equipo durante turnos de alta demanda”.
3. Guardar una copia exacta del texto original para compararlo al final.
4. Pulsar “Mejorar con IA” y esperar la respuesta o el error visible.
5. Verificar que aparece una propuesta no vacía, editable y relacionada con el texto original.
6. Verificar que el campo original sigue idéntico antes de pulsar “Usar esta versión”.
7. Editar la propuesta, pulsar “Usar esta versión” y comprobar que el campo original recibe el texto editado.
8. Repetir en el mismo navegador con el identificador anónimo ya utilizado: debe informar que el uso gratuito fue consumido y no generar otra propuesta.

### Caso B – mejora con sesión autenticada

1. Iniciar sesión con la cuenta candidata de prueba.
2. Abrir la edición del perfil y modificar temporalmente “Sobre vos” con texto sintético.
3. Solicitar una mejora y verificar que la propuesta aparece sin sobrescribir el texto original.
4. Editar y aplicar la propuesta; comprobar que solo entonces cambia el campo.
5. Guardar el perfil y recargar la pantalla. Comprobar que se conserva la versión aplicada.
6. Verificar el contador de cuota informado por backend antes y después de la operación. No inferir el consumo únicamente por el texto del botón.

### Caso C – controles negativos y seguridad

1. Probar texto vacío y texto superior al máximo admitido por la interfaz: debe impedir el envío o mostrar validación clara.
2. Probar una sesión vencida o cerrar sesión antes de invocar la mejora autenticada: no debe devolver datos de otro usuario ni aceptar una operación autenticada sin sesión.
3. Simular proveedor no disponible solo en un entorno controlado: debe mostrarse un error comprensible y no reemplazarse el texto original.
4. Verificar que no aparecen claves, tokens ni contenido sensible en la interfaz, URL, consola o reportes de evidencia.
5. No forzar fallos repetidos en staging: cada invocación puede consumir cuota o generar costos.

### Caso D – sugerencias IA para chat (solo si la interfaz ya está integrada)

La Edge Function `sugerir-respuestas-chat` existe, pero la rama auditada no integra actualmente el botón en el frontend. No marcar este caso como PASS ni simularlo desde una llamada directa. Primero debe implementarse la integración UI; luego probar con una empresa autenticada, un chat que pertenezca a esa empresa y tres sugerencias distintas. También comprobar que un usuario candidato o una empresa ajena al chat recibe rechazo.

## 3. Checklist para tester manual

### Registro, login y sesión
- [ ] Registrar una cuenta candidata de prueba y completar los pasos.
- [ ] Registrar una cuenta empresa de prueba.
- [ ] Cerrar sesión e iniciar sesión con ambas cuentas.
- [ ] Verificar que cada rol llega a su panel correcto.
- [ ] Intentar abrir una ruta privada sin sesión: debe redirigir o bloquear el acceso.
- [ ] Probar credenciales incorrectas y recuperación de contraseña.

### Datos y postulaciones
- [ ] Confirmar que el estado inicial no muestra ofertas, candidatos, chats ni notificaciones ficticias.
- [ ] Crear una búsqueda desde la cuenta empresa y comprobar que aparece en su panel.
- [ ] Verificar que la oferta aparece en el feed candidato.
- [ ] Postularse y comprobar que se crea una única postulación real.
- [ ] Confirmar que la oferta deja de aparecer como disponible para ese candidato.
- [ ] Pausar la búsqueda y comprobar que deja de aceptar nuevas postulaciones.
- [ ] Verificar chat y notificaciones solo después de que exista el flujo real correspondiente.

### “Sobre vos” con IA
- [ ] La herramienta aparece solo en staging.
- [ ] Se muestra el aviso sobre el envío del texto al servicio de IA.
- [ ] La propuesta es editable y no altera el original automáticamente.
- [ ] “Usar esta versión” aplica exactamente la propuesta editada.
- [ ] Se informa correctamente el saldo de cuota.
- [ ] Si el proveedor falla, el original se conserva y aparece un error entendible.
- [ ] Un visitante no puede reutilizar el único uso anónimo del mismo identificador.

### Denuncias y verificación
- [ ] Un candidato puede abrir el formulario de denuncia desde un contexto permitido.
- [ ] Los motivos y el límite de 2.000 caracteres se muestran correctamente.
- [ ] La denuncia se asocia a la empresa y postulación/chat correctos.
- [ ] Una empresa no puede autoverificarse ni editar el listado de verificadas.
- [ ] El tilde de verificación es únicamente visual; no altera permisos ni ranking.

### Responsive y errores
- [ ] Repetir los flujos principales en escritorio y móvil.
- [ ] Revisar que no haya desbordes, botones inaccesibles ni campos cortados.
- [ ] Revisar consola y Network: sin errores JS, respuestas 4xx/5xx inesperadas ni secretos expuestos.
- [ ] Recargar cada pantalla crítica y verificar persistencia de los cambios guardados.

## 4. Criterio de aprobación y reporte

Un caso es **PASS** solo si la acción se ejecutó en la aplicación y el resultado observado coincide con el esperado. Si no se pudo ejecutar por falta de credenciales, cuota, proveedor o integración de UI, marcar **BLOCKED**; no marcarlo como PASS. Si el resultado contradice lo esperado, marcar **FAIL** y adjuntar evidencia sanitizada.

Formato de reporte:

| Campo | Contenido |
|---|---|
| Entorno / URL | Staging o Deploy Preview |
| Commit probado | SHA completo |
| Navegador / dispositivo | Versión y tamaño de pantalla |
| Caso | A, B, C, D o checklist manual |
| Resultado | PASS / FAIL / BLOCKED |
| Evidencia | Captura, video o traza sanitizada |
| Incidencia | Pasos mínimos para reproducir |

## 5. Alcance y límites

- Las 18 pruebas estáticas corren en GitHub Actions en cada actualización del PR.
- El E2E con Gemini Argon y el checklist manual son validaciones separadas; esta guía no los ejecuta automáticamente.
- No se debe conectar un agente con permisos de escritura a producción.
- No guardar credenciales en prompts, issues, commits, capturas ni artifacts públicos.
- Para automatizar E2E en CI más adelante, usar Playwright con secretos de cuentas de staging en GitHub Actions y un proyecto de prueba aislado. Mantener las pruebas de proveedor IA detrás de un job separado y con límites de costo/cuota.
