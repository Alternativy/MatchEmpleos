# Requisitos de localización y URLs

## Alcance

Esta especificación define los requisitos para incorporar versiones localizadas de Match Empleos. En esta etapa se documentan los criterios; no implica que las traducciones ni el enrutamiento localizado ya estén implementados.

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
