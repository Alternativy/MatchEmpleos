## 12. Pendientes para la próxima publicación a producción

### Pendientes funcionales y de experiencia

- [ ] **UX/UI del login:** revisar jerarquía visual, espaciados, responsive, estados de carga, validaciones, mensajes de error y accesibilidad. El flujo funcional está implementado, pero su experiencia visual todavía requiere una pasada específica.
- [ ] **Login end-to-end:** probar en staging con cuentas reales de candidato y empresa, incluyendo contraseña incorrecta, correo sin confirmar, sesión persistente al refrescar, recuperación de contraseña, cierre de sesión y redirección según rol. La revisión de código no reemplaza esta prueba.
- [ ] **Funcionalidad de IA:** el frontend ya invoca `mejorar-sobre` en staging y producción. Antes de publicar, probar en ambos entornos proveedores, errores/timeout, cuotas y uso anónimo; verificar que `GEMINI_API_KEY` y/o `GROQ_API_KEY` estén configuradas en producción.
- [ ] **UX/UI de la asistencia IA:** revisar claridad del botón, presentación de la propuesta, comparación con el original, aplicación/rechazo y mensajes de cuota o indisponibilidad.


- [ ] **Google Search Console (después del merge a producción):** verificar la propiedad de dominio `matchempleos.com.ar` con el registro TXT en el DNS, pedir indexación de `https://matchempleos.com.ar/` y enviar `sitemap.xml`. Revisar que `matchempleos.netlify.app` no aparezca indexado.
- [ ] **Imagen para compartir** de 1200×630: `og:image` apunta actualmente a `img/seniala-celular.png`; falta validar encuadre y proporción para redes.
- [ ] **Subir el `site.webmanifest` corregido** a `img/` (nombre, rutas de íconos relativas).
- [x] **`robots.txt` y `sitemap.xml`** en la raíz de `test-empleos`. Pasan a producción con el pull request.
- [x] **Landing con una sola fuente de texto** (HTML estático en `#root`).
- [ ] Ejecutar la sección 8 (Storage y Auth) y la configuración de URLs de redirección de producción.
- [ ] Páginas legales como URLs propias (`privacidad.html`, `terminos.html`, `ayuda.html`), para indexarlas.
- [ ] Verificar el dominio en Google Search Console después del merge a producción, pedir indexación de `https://matchempleos.com.ar/` y enviar `sitemap.xml`.

---