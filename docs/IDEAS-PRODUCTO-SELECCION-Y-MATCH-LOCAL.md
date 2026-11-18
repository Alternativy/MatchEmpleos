# Ideas de producto: selección, contratación y Match Local

> **Estado:** propuesta / ideas para evaluar.  
> **No implica implementación:** las funcionalidades de este documento no deben presentarse como disponibles ni como compromisos de desarrollo hasta que exista una decisión de producto, diseño técnico, implementación y validación.

## 1. Visión

Evolucionar Match Empleos desde una plataforma de conexión entre candidatos y empresas hacia una herramienta accesible para descubrir talento, gestionar procesos de selección y facilitar contrataciones.

La propuesta contempla dos segmentos complementarios:

1. **Empresas y equipos de RR. HH.:** herramientas para organizar y acelerar procesos de selección.
2. **Pequeños comercios:** una forma sencilla de reemplazar la recepción y acumulación de CV en papel, incluso cuando todavía no tienen una búsqueda laboral formal.

Una hipótesis central es que Match puede resolver más etapas del proceso que un portal tradicional: captar candidatos, encontrar perfiles compatibles, organizar la selección y acompañar la contratación.

## 2. Herramientas para empresas y selección

### 2.1. ATS propio (Applicant Tracking System)

Un tablero para administrar candidatos por etapas configurables, por ejemplo:

- Postulantes.
- Preseleccionados.
- Entrevista inicial.
- Entrevista final.
- Oferta laboral.
- Contratados.
- No seleccionados.

Cada candidatura podría conservar su historial, notas, comunicaciones y cambios de etapa. El sistema debería permitir búsquedas con distintos procesos simultáneos y evitar mezclar candidatos de distintas vacantes.

### 2.2. Ranking inteligente y explicable

Comparar los requisitos de una búsqueda con la información profesional de los candidatos:

- Habilidades y experiencia relevantes.
- Formación y certificaciones requeridas.
- Disponibilidad y preferencias horarias.
- Ubicación o distancia, cuando sea pertinente.
- Tipo de jornada y modalidad.
- Otros requisitos objetivos definidos para el puesto.

El resultado debería explicar qué criterios coinciden, cuáles no y qué información falta. El porcentaje no debe presentarse como probabilidad de éxito o contratación. La IA no debe tomar decisiones finales ni inferir características sensibles.

### 2.3. Búsqueda semántica de candidatos

Permitir que el empleador describa en lenguaje natural lo que necesita. Ejemplo:

> “Busco una persona con experiencia atendiendo clientes, manejo de caja y disponibilidad los fines de semana”.

La búsqueda podría combinar:

- Embeddings de perfiles y búsquedas.
- PostgreSQL con pgvector.
- Búsqueda vectorial y filtros SQL.
- Una Edge Function para coordinar la consulta.

La búsqueda semántica debería recuperar perfiles relevantes aunque no utilicen exactamente las mismas palabras que el empleador. Los filtros estructurados deben seguir siendo controlables y verificables.

### 2.4. Asistente de selección con IA

Un asistente contextual para ayudar a:

- Redactar descripciones de puestos a partir de una conversación.
- Extraer habilidades y requisitos de un aviso.
- Resumir perfiles y CV.
- Preparar preguntas de entrevista.
- Consultar el estado de una búsqueda.
- Resumir avances y pendientes.
- Sugerir próximos pasos al reclutador.

Las recomendaciones deben estar basadas en datos visibles para la empresa y permitir revisión humana.

### 2.5. Entrevistas y evaluaciones

Posibles herramientas:

- Agenda de entrevistas con horarios disponibles.
- Integración con Google Calendar y plataformas de videollamada.
- Entrevistas asincrónicas por audio, video o texto.
- Preguntas configurables según el puesto.
- Guías de entrevista estructurada.
- Evaluación por competencias.
- Scorecards y comentarios internos.
- Evaluación colaborativa entre varios miembros de la empresa.

Los resúmenes de IA deben servir como asistencia, no como evaluación automática definitiva de una persona.

### 2.6. Analítica de contratación

Un panel para conocer:

- Postulaciones recibidas por búsqueda.
- Conversión entre etapas.
- Tiempo hasta la primera entrevista.
- Tiempo total de cobertura.
- Candidatos contactados y entrevistados.
- Fuentes de candidatos más efectivas.
- Búsquedas con dificultades de cobertura.

Las métricas deben tener definiciones claras, períodos y denominadores consistentes.

## 3. Funcionalidades para candidatos

- **Perfil profesional dinámico:** perfil estructurado que se actualice con experiencia, formación y habilidades.
- **Perfil express:** permitir postularse sin tener que completar un CV extenso ni crear una cuenta antes de enviar los datos mínimos.
- **Detector de habilidades:** ayudar a identificar competencias adquiridas en experiencias formales e informales y expresarlas profesionalmente.
- **Recomendador de oportunidades:** sugerir búsquedas según experiencia, preferencias, disponibilidad y ubicación.
- **Preparación para entrevistas:** simulaciones y recomendaciones vinculadas al puesto.
- **Seguimiento de postulaciones:** estado y actividad de cada proceso.
- **Alertas relevantes:** avisos de nuevas oportunidades compatibles.
- **Perfil verificable:** posibilidad de validar formación, certificaciones o experiencia mediante documentación o terceros, con reglas claras sobre qué significa cada verificación.

## 4. Match Local: recepción digital de postulaciones para comercios

### 4.1. Problema

En muchos comercios pequeños, las personas se acercan presencialmente, preguntan si necesitan personal y dejan un CV impreso. El comerciante puede guardar esos documentos sin una forma práctica de clasificarlos, buscarlos o volver a contactar a esas personas cuando aparece una vacante.

Match Local propone digitalizar esa práctica sin exigir que el comercio aprenda a utilizar un ATS complejo.

### 4.2. Propuesta

Cada comercio tendría una página pública y un QR permanente para recibir postulaciones espontáneas, incluso cuando no tenga búsquedas activas.

Ejemplo conceptual de URL:

`matchempleos.com.ar/local/nombre-del-comercio`

El QR podría colocarse en la vidriera, mostrador, caja o cartel de “Estamos buscando personal”.

### 4.3. Flujo del candidato

1. Escanea el QR.
2. Accede a la página del comercio.
3. Indica qué tipo de trabajo busca.
4. Completa datos mínimos, experiencia y disponibilidad.
5. Adjunta su CV si tiene uno.
6. Envía su postulación.
7. Puede recibir una invitación posterior para crear o completar su cuenta de Match.

No se debería obligar a crear una cuenta antes de enviar una postulación express. La página debe informar quién recibe los datos y para qué se utilizarán.

### 4.4. Panel del comercio

El comerciante podría consultar y organizar:

- Personas que dejaron su perfil.
- Puestos o rubros de interés.
- Experiencia y habilidades declaradas.
- Disponibilidad horaria.
- Fecha de postulación.
- CV adjunto.
- Estado de contacto.
- Notas y etiquetas internas.

La base debería poder utilizarse para futuras búsquedas, respetando el consentimiento y las preferencias de visibilidad de cada candidato.

### 4.5. QR y canales de recepción

- QR permanente asociado al comercio.
- QR específico para una búsqueda o sucursal.
- Link compartible por WhatsApp e Instagram.
- Cartel imprimible generado desde Match.
- Formulario web accesible desde celular.
- Registro de postulaciones espontáneas sin búsqueda activa.

### 4.6. Digitalización de CV en papel y WhatsApp

Agregar una opción para que el comerciante fotografíe o cargue un CV recibido presencialmente o por mensajería. Un servicio de extracción documental podría proponer datos estructurados para crear un registro de candidato.

El comerciante debería revisar y confirmar la información extraída antes de guardarla. Se debe evitar que la IA invente datos o modifique el contenido original del CV.

### 4.7. Red de talento hiperlocal

La propuesta puede ampliarse desde el buzón individual de cada comercio hacia una red de oportunidades de cercanía:

- Recomendar oportunidades según zona, preferencias y disponibilidad.
- Permitir que un candidato utilice su perfil para postularse a distintos comercios sin volver a cargar toda su información.
- Mostrar a los comercios candidatos que hayan autorizado ser descubiertos por otros empleadores.
- Permitir búsquedas por distancia y compatibilidad laboral.
- Recontactar candidatos anteriores para consultar si siguen disponibles.

La visibilidad entre comercios no debe ser automática: requiere autorización clara del candidato y controles para revocarla.

## 5. Otras funcionalidades para contratación

- **Ofertas laborales:** generar una propuesta con puesto, remuneración, condiciones y fecha de incorporación.
- **Aceptación y documentación:** registrar aceptación y facilitar el intercambio de documentos. Evaluar firma electrónica con un proveedor especializado.
- **Onboarding:** checklist de tareas, documentación y seguimiento de incorporación.
- **Referidos:** permitir que usuarios recomienden candidatos y registrar el origen de la recomendación.
- **Múltiples sucursales:** administrar búsquedas, QR y candidatos por ubicación.
- **Recontacto:** consultar disponibilidad de candidatos de procesos anteriores, respetando sus permisos y preferencias.

## 6. Integraciones externas a evaluar

No se propone incorporar todas estas integraciones de inmediato. Cada una debe justificarse por uso, costo, privacidad y mantenimiento.

| Servicio | Posible uso |
|---|---|
| OpenAI API u otro proveedor de IA | Extracción, redacción, matching y asistentes |
| Google Calendar | Coordinación de entrevistas |
| Google Meet u otro proveedor | Videollamadas |
| Resend u otro proveedor de correo | Notificaciones y comunicaciones |
| WhatsApp Business Platform mediante proveedor autorizado | Avisos y comunicación con candidatos |
| Mercado Pago | Suscripciones y cobros en Argentina |
| DocuSign u otro proveedor de firma | Firma de ofertas y documentos |

## 7. Arquitectura técnica posible

La infraestructura actual de Match Empleos utiliza frontend web y Supabase. Las ideas podrían evaluarse sobre esa base, sin asumir que todas requieren una nueva infraestructura.

Componentes posibles:

- **Frontend:** páginas públicas de recepción, panel de comercio, ATS y panel de candidato.
- **Supabase Auth:** identidad y sesiones de usuarios registrados.
- **PostgreSQL:** empresas, sucursales, búsquedas, postulaciones, etapas, evaluaciones y consentimientos.
- **pgvector:** embeddings para búsqueda semántica, si se valida su utilidad.
- **Edge Functions:** recepción y validación de postulaciones, procesamiento de documentos, matching y notificaciones.
- **Storage privado:** CV y documentación con políticas de acceso específicas.
- **Procesamiento asíncrono:** tareas pesadas como extracción de CV, generación de embeddings y análisis de grandes volúmenes.

### Entidades conceptuales a evaluar para Match Local

Estos son nombres orientativos, no un esquema aprobado ni migraciones para ejecutar:

| Entidad conceptual | Responsabilidad |
|---|---|
| `business_recruitment_pages` | Página pública de recepción de postulaciones |
| `recruitment_qr_codes` | Identificadores, destinos y campañas QR |
| `spontaneous_applications` | Postulaciones espontáneas |
| `candidate_consents` | Consentimientos, alcance y revocaciones |
| `candidate_tags` | Etiquetas internas de organización |
| `business_locations` | Sucursales y ubicaciones |

Antes de implementar, revisar el esquema existente para reutilizar tablas y relaciones cuando corresponda. No crear entidades duplicadas ni ejecutar migraciones basándose solamente en esta propuesta.

## 8. Benchmark competitivo inicial

El relevamiento exploratorio de esta conversación identificó productos que conviene estudiar:

| Producto | Aspecto a investigar |
|---|---|
| Computrabajo | Alcance, volumen de candidatos y publicación de empleos |
| Bumeran / ZonaJobs | Captación y herramientas para empresas |
| LinkedIn Recruiter | Búsqueda proactiva y matching |
| Hiring Room | Gestión de procesos de selección y ATS |
| Pandapé | Integración de portal, ATS y automatización |
| Eightfold AI | Inteligencia de talento y matching por habilidades |
| HireVue | Entrevistas y evaluaciones digitales |
| Paradox | Automatización conversacional |
| Qontrata | Buzón de postulaciones espontáneas mediante QR |
| TuCV | Empleo hiperlocal y contacto directo |
| Ciudita | Herramientas de empleo para comercios y carga de postulantes presenciales |
| Comercio Local | CV digital y búsqueda de talento local |
| TrabajoHOY | Oportunidades laborales locales y contacto directo |

Referencias consultadas durante el relevamiento:

- https://qontrata.ar/postulaciones-espontaneas
- https://tucv.ar/
- https://www.ciudita.com/p/servicios-empleo
- https://localcomercio.com.ar/
- https://trabajo-hoy.com/
- https://business.linkedin.com/es/es/hire
- https://www.hiringroom.com/
- https://www.pandape.com/

Este benchmark es exploratorio, no una auditoría exhaustiva ni una confirmación de que todas las funciones estén disponibles en todos los planes. Antes de tomar decisiones, verificar producto, disponibilidad geográfica, precios y condiciones vigentes. La existencia de competidores demuestra que el problema ya tiene soluciones; la oportunidad está en encontrar una experiencia mejor integrada y adaptada al comercio pequeño.

## 9. Posicionamiento estratégico propuesto

Tres espacios posibles:

1. **Portal de empleo inteligente:** competir mediante CV, matching y experiencia de postulación.
2. **ATS accesible:** ofrecer gestión de selección sencilla para empresas que no necesitan un sistema corporativo.
3. **Plataforma integral de contratación:** combinar captación, matching, selección y contratación.

Para el segmento de pequeños comercios, el posicionamiento específico podría ser:

> **Match Local: la forma simple de recibir, organizar y encontrar personal sin acumular currículums en papel.**

La diferenciación no debería ser solamente “un QR para recibir CV”, porque ya existen propuestas similares. La oportunidad está en conectar el QR con un perfil reutilizable, una base de talento local, matching y futuras búsquedas.

## 10. Priorización sugerida

### Etapa 1 — Validar Match Local

- Entrevistar comerciantes y candidatos.
- Probar una página pública por comercio.
- Generar QR permanente.
- Implementar formulario de postulación express.
- Crear una bandeja simple para consultar y contactar candidatos.
- Validar consentimiento y tratamiento de datos.

### Etapa 2 — Organizar la selección

- Estados y etapas de candidatos.
- Etiquetas y filtros.
- Recontacto de candidatos.
- Carga de CV recibidos en papel o por WhatsApp.
- QR por sucursal y por búsqueda.

### Etapa 3 — Inteligencia y red local

- Matching explicable.
- Búsqueda semántica.
- Alertas de candidatos compatibles.
- Recomendaciones de oportunidades cercanas.
- Red de talento hiperlocal con visibilidad autorizada.

### Etapa 4 — ATS y contratación integral

- Evaluaciones colaborativas.
- Agenda y entrevistas.
- Analítica.
- Ofertas laborales.
- Firma y onboarding.

## 11. Piloto de validación

Propuesta inicial: piloto con 15 a 20 comercios de una zona acotada, por ejemplo Burzaco y Adrogué, durante 30 días.

Indicadores:

- Comercios que activan y exhiben su QR.
- Escaneos por comercio.
- Porcentaje de escaneos que termina en postulación.
- Postulaciones completadas.
- Porcentaje de perfiles con CV adjunto.
- Comercios que vuelven a consultar su base.
- Candidatos contactados.
- Entrevistas generadas.
- Contrataciones atribuibles al canal.
- Comercios que desean continuar utilizando el servicio.

No tomar la cantidad de escaneos como único indicador de éxito: el objetivo es comprobar que el canal produce perfiles utilizables y ayuda a cubrir necesidades reales de personal.

## 12. Privacidad, seguridad y uso responsable de IA

Toda implementación debe contemplar:

- Consentimiento informado y específico para recibir, conservar y utilizar postulaciones.
- Explicar si el perfil será visible solamente para el comercio receptor o también para otros empleadores.
- Permitir consultar, corregir y solicitar eliminación de datos.
- Definir plazos de conservación y procesos de eliminación.
- Proteger CV y documentación con Storage privado y controles de acceso.
- Evitar exponer datos personales mediante páginas públicas o QR.
- No compartir perfiles entre comercios sin autorización.
- No utilizar atributos sensibles ni proxies discriminatorios para ordenar candidatos.
- Explicar criterios del matching y permitir revisión humana.
- Revisar los proveedores externos y los datos enviados a sus APIs.

## 13. Decisiones pendientes

Antes de iniciar el desarrollo, producto debería resolver:

1. ¿Match Local será una funcionalidad dentro de las cuentas de empresa actuales o tendrá un flujo simplificado específico para comercios?
2. ¿Se permitirá postularse sin cuenta y cómo se vinculará luego esa postulación con un perfil registrado?
3. ¿Qué información mínima se solicita en una postulación express?
4. ¿Durante cuánto tiempo se conserva una postulación espontánea?
5. ¿El candidato puede autorizar que otros comercios de la red lo encuentren?
6. ¿Cómo se gestionan múltiples sucursales y permisos de sus empleados?
7. ¿Qué parte del proceso de digitalización de CV se automatiza y cuál requiere confirmación del comerciante?
8. ¿Qué indicadores determinarán si el piloto justifica continuar?

---

**Criterio final:** estas propuestas son hipótesis de producto para investigar y priorizar. La primera validación recomendada es Match Local: recepción de postulaciones espontáneas mediante QR, postulación express y una bandeja sencilla para el comercio. Permite probar un segmento concreto con un alcance acotado antes de invertir en un ATS completo o en matching avanzado.
