# Requisitos de localización y URLs

## Alcance

Esta especificación define los requisitos de localización de Match Empleos. La versión inglesa se implementa en `/en/`; la versión española conserva su URL y comportamiento. La versión portuguesa y la revisión editorial de las traducciones quedan pendientes.

## URLs por idioma

- La versión en español conservará su URL actual y no cambiará su comportamiento de navegación.
- Cada versión localizada deberá servirse bajo un prefijo de idioma propio.
- Inglés: `/en/`.
- Portugués: `/pt/`.
- Los prefijos deberán funcionar tanto en producción como en los deploy previews de Netlify, manteniendo el dominio base del entorno.

Ejemplos:
- Producción en inglés: `https://matchempleos.com.ar/en/`.
- Testing en inglés: `https://deploy-preview-23--matchempleos.netlify.app/en/`.

El número de deploy preview es ilustrativo: cada preview deberá resolver el prefijo de idioma correspondiente en su propia URL.

## SEO e indexación

- Las páginas localizadas distintas de español no deberán ser indexadas por los motores de búsqueda.
- La implementación deberá aplicar una directiva de no indexación adecuada a cada página traducida, por ejemplo `noindex` mediante meta robots o una cabecera equivalente.
- La directiva deberá estar presente en la respuesta renderizada de las páginas traducidas y no depender únicamente de una instrucción ejecutada después de que la página pueda ser indexada.
- La página española conservará su comportamiento SEO actual; no se deberá agregar una directiva de no indexación a la versión española como parte de este requisito.

## Criterio editorial

Las traducciones iniciales podrán generarse con IA. La revisión y corrección de la redacción localizada queda fuera de esta etapa y se realizará más adelante. El objetivo inmediato es permitir que más personas dentro de Argentina accedan a la plataforma en otros idiomas.

## Criterios de aceptación

1. La URL española actual permanece sin cambios.
2. La versión inglesa se sirve en `/en/` y la portuguesa en `/pt/`.
3. Los prefijos localizados funcionan en producción y en previews de Netlify.
4. Todas las páginas localizadas no españolas emiten una directiva de no indexación.
5. La versión española no recibe esa directiva como consecuencia de la localización.
6. La corrección editorial de las traducciones no bloquea esta primera etapa.

## Pendiente de marca

- Renaming del logo: reemplazar la denominación visual actual por **MatchJobs** en una etapa posterior. El logo gráfico no se modifica en esta implementación.
- La versión portuguesa (`/pt/`) sigue pendiente. Su opción permanece deshabilitada en el selector hasta que esté disponible.

## Páginas traducidas al inglés

- [x] Términos y Condiciones: traducidos en la versión inglesa para la página pública y el acceso desde los paneles de postulantes y empresas.
- [x] Centro de Ayuda: traducido en la versión inglesa para la página pública y el acceso desde los paneles de postulantes y empresas.
- [ ] Revisión editorial y legal de las traducciones antes de considerarlas versiones definitivas.

## Pendientes de implementación y verificación

- [ ] Verificar por qué el Deploy Preview actual del PR #23 no refleja de forma visible la corrección del footer: `2026 - Match Empleos - All rights reserved.`. El texto ya está presente en `en/index.html` de la rama `localizacion`; falta comprobar que Netlify haya publicado el commit más reciente y descartar caché del navegador/CDN.
- [ ] Implementar la localización completa de los paneles de la aplicación para inglés (`/en/`) y portugués (`/pt/`). La traducción actual de la landing no implica que las vistas internas estén localizadas.

## Desafíos para localizar los paneles de la aplicación

La implementación deberá contemplar, como mínimo, los siguientes puntos:

1. **Inventario de pantallas y textos:** relevar los paneles de postulantes y empresas, además de registro, inicio de sesión, perfil, publicaciones, postulaciones, coincidencias, chats, configuración, recuperación de contraseña y estados vacíos. Identificar también modales, tooltips, botones, placeholders, mensajes de ayuda y textos accesibles.
2. **Centralización de traducciones:** evitar traducir el DOM mediante reemplazos generales de cadenas. Definir un sistema de internacionalización con claves estables por contexto y archivos/diccionarios separados por idioma. Los componentes deberán consumir esas claves para que las traducciones sean mantenibles y comprobables.
3. **Textos dinámicos y estados:** contemplar validaciones de formularios, errores, confirmaciones, notificaciones, límites de uso, estados de carga, ausencia de resultados y estados de postulaciones o publicaciones. No deben quedar mensajes en español cuando una operación falla o cambia de estado.
4. **Datos frente a etiquetas:** traducir las etiquetas de la interfaz, pero no modificar el contenido aportado por usuarios, como nombres, descripciones de empresas, ofertas laborales, mensajes de chat o textos de CV. Los valores internos y estados guardados en la base de datos deben conservar identificadores estables; su representación visible se localizará en el frontend.
5. **Integración con Supabase y Edge Functions:** revisar los mensajes de error y respuesta que llegan desde Auth, consultas, políticas y funciones. Cuando el backend devuelva códigos o identificadores, el frontend deberá mapearlos a mensajes localizados. No conviene depender de traducir literalmente mensajes técnicos del proveedor.
6. **Contenido generado por IA:** definir cómo se determina el idioma de las respuestas de las funciones de IA, las sugerencias de chat y las mejoras de CV. El idioma elegido debe enviarse explícitamente como contexto cuando corresponda, sin traducir automáticamente datos originales del usuario.
7. **Formato regional:** localizar fechas, horas, números, porcentajes y monedas mediante formatos regionales coherentes. La localización del idioma no debe alterar los importes ni los datos almacenados.
8. **Persistencia y navegación:** mantener el idioma elegido al iniciar sesión, navegar entre paneles, abrir enlaces directos y recargar la página. Definir una regla de prioridad entre prefijo de URL, preferencia guardada y el idioma predeterminado; los enlaces compartidos deberán conservar el idioma cuando sea posible.
9. **Diseño adaptable:** comprobar que textos más largos en inglés o portugués no desborden botones, tarjetas, tablas, menús, encabezados ni modales. Evitar resolverlo reduciendo indiscriminadamente el tamaño de fuente.
10. **Pruebas de regresión:** verificar los flujos principales de postulantes y empresas en cada idioma, incluidos registro/login, publicación, postulación, matching, chat, CV y errores. Comprobar que no queden cadenas visibles sin traducir y que el cambio de idioma no modifique la lógica funcional.

### Criterios para considerar completa la localización de los paneles

- [ ] Los paneles de postulantes y empresas están disponibles en inglés y portugués.
- [ ] Los textos de interfaz, estados, validaciones, notificaciones y errores están localizados.
- [ ] Los datos escritos por usuarios permanecen intactos y no se traducen automáticamente.
- [ ] Los estados y valores internos de Supabase conservan sus identificadores; solo cambia su presentación.
- [ ] Las respuestas de IA respetan el idioma seleccionado cuando la función lo permite.
- [ ] El idioma persiste durante la navegación y al recargar o abrir enlaces directos.
- [ ] Los diseños se validan en desktop y mobile para evitar desbordes.
- [ ] Los flujos principales cuentan con pruebas de regresión en ambos idiomas.

