import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const edgeFunction = await readFile(new URL("../supabase/functions/generar-cv/index.ts", import.meta.url), "utf8");

test("la preview del CV mantiene proporción A4 vertical", () => {
  const style = html.match(/\.cv-paper\s*\{([^}]*)\}/);
  assert.ok(style, "No se encontró la regla CSS de .cv-paper");

  const css = style[1].replace(/\s+/g, " ").toLowerCase();
  assert.match(css, /aspect-ratio\s*:\s*210\s*\/\s*297\b/, "La preview debe usar la proporción A4 vertical (210:297)");
  assert.match(css, /width\s*:\s*100%/, "La hoja debe adaptarse al ancho disponible");
  assert.match(css, /max-width\s*:\s*790px/, "La hoja debe conservar un ancho máximo legible");
  assert.match(css, /overflow\s*:\s*hidden/, "El contenido no debe expandir visualmente la hoja");
  assert.ok(Math.abs(210 / 297 - 0.7070707) < 0.000001, "La proporción A4 vertical debe ser aproximadamente 0,7071");
});

test("la impresión del CV está configurada en A4 vertical", () => {
  assert.match(html, /@page\s*\{\s*size\s*:\s*A4\s+portrait\s*;/i);
  assert.match(html, /#cv-paper\s*\{[^}]*height\s*:\s*277mm/i);
});


test("las secciones del CV distribuyen el espacio vertical disponible", () => {
  assert.match(html, /\.cv-paper\s*\{[^}]*display\s*:\s*flex/i);
  assert.match(html, /\.cv-paper\s*\{[^}]*flex-direction\s*:\s*column/i);
  assert.match(html, /\.cv-paper\s+\.cv-sections\s*\{[^}]*justify-content\s*:\s*space-between/i);
  assert.match(html, /<div class="cv-sections">[\s\S]*?section\("Información adicional"/);
});

test("el espaciado adaptativo también se aplica al PDF A4", () => {
  assert.match(html, /#cv-paper\s+\.cv-sections\s*\{[^}]*justify-content\s*:\s*space-between/i);
  assert.match(html, /#cv-paper\s+\.cv-sections>section\s*\{[^}]*flex\s*:\s*0\s+0\s+auto/i);
});


test("el contador aparece solo desde los 3.500 caracteres y se oculta por debajo", () => {
  assert.match(html, /data-cv-char-field="true"/);
  assert.match(html, /maxlength="4000"/);
  assert.ok(html.includes('data-cv-char-counter="${id}"'));
  assert.match(html, /const CV_FIELD_CHAR_LIMIT = 4000/);
  assert.match(html, /content\.length < 3500 \? " hidden" : ""/, "Al crear el campo, el contador debe estar oculto por debajo de 3.500 caracteres");
  assert.match(html, /counter\.hidden = input\.value\.length < 3500/, "Al escribir, debe ocultarse por debajo de 3.500 y mostrarse desde ese valor");
  assert.match(html, /cvUpdateCharCounter\(e\.target\)/);
  assert.doesNotMatch(html, /CV_TOTAL_CHAR_LIMIT|cv-char-counter" id="cv-char-counter"/);
});

test("la descarga PDF captura la misma preview HTML sin modificar su diseño", () => {
  assert.ok(html.includes('<script src="vendor/jspdf.umd.min.js"></script>'));
  assert.ok(html.includes('src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"'));
  assert.match(html, /async function descargarCV\(\)/);
  assert.match(html, /capture\(paper,\s*\{/);
  assert.match(html, /pdf\.addImage\(image, "PNG", 0, 0, 210, 297/);
  assert.ok(html.includes('pdf.save("CV-" + filename + ".pdf")'));
  const download = html.slice(html.indexOf("async function descargarCV()"), html.indexOf("function cPerfil()"));
  assert.equal(download.includes("window.print"), false);
  assert.equal(download.includes("paper.innerHTML ="), false, "La descarga no debe alterar el HTML de la preview");
});

test("la preview separa menos el contacto del puesto y más el puesto del perfil", () => {
  assert.match(html, /\.cv-paper \.cv-contact\{[^}]*margin-bottom:8px/);
  assert.match(html, /\.cv-paper \.cv-target-role\{margin:0 0 20px\}/);
  assert.match(html, /class="cv-target-role"/);
});


test("el constructor permite incluir u omitir la foto de perfil en preview y PDF", () => {
  assert.match(html, /id="cv-include-photo" type="checkbox"/);
  assert.match(html, /include_photo: !!document\.getElementById\("cv-include-photo"\)\?\.checked/);
  assert.match(html, /d\.include_photo && p\.photo_url/);
  assert.match(html, /cv-profile-photo/);
  assert.match(html, /photo_url: prev\.personal\?\.photo_url \|\| ME\.avatarUrl/);
  assert.match(html, /include_photo: profile\.include_photo/);
  assert.match(html, /e\.target\?\.id === "cv-include-photo"/);
});


test("la experiencia laboral de la preview separa puesto, empresa, fechas y tareas", () => {
  assert.match(html, /class="cv-entry-role"/);
  assert.match(html, /class="cv-entry-company"/);
  assert.match(html, /class="cv-entry-dates"/);
  assert.match(html, /\.cv-entry:not\(:last-child\)\{border-bottom:1px solid #dae2e9\}/);
  assert.match(html, /\.cv-paper \.cv-entry-role\{display:block/);
  assert.match(html, /\.cv-paper \.cv-entry-dates\{font-size:9px;font-style:italic/);
});

test("el estado de descarga no agrega aclaraciones sobre el formato", () => {
  assert.match(html, /status\) status\.textContent = "Descargando PDF"/);
  assert.doesNotMatch(html, /PDF A4 descargado con el mismo formato de la vista previa/);
  assert.doesNotMatch(html, /Preparando el PDF con el mismo diseño de la vista previa/);
});

test("la opción de foto usa el checkbox y el texto solicitado", () => {
  assert.match(html, /<strong>Incluir foto de perfil en el CV<\/strong>/);
  assert.match(html, /id="cv-include-photo" type="checkbox"/);
  assert.match(html, /Primero subí una foto desde tu perfil para poder incluirla/);
  assert.doesNotMatch(html, /Foto visible|La foto se toma de tu perfil de Match Empleos/);
});

test("guardarDatosPerfil confirma la escritura solicitando la fila actualizada", () => {
  const start = html.indexOf("guardarDatosPerfil(nombre, datos)");
  const end = html.indexOf("cambiarEstadoBusqueda", start);
  const saveMethod = html.slice(start, end);
  assert.match(saveMethod, /\.update\(\{ nombre, datos \}\)\.eq\("id", ME\.id\)\.select\("id"\)\.single\(\)/);
  assert.match(saveMethod, /if \(!ME\.id\)/);
});


test("la descarga PDF conserva el formato mejorado de experiencia de la preview A4", () => {
  const download = html.slice(html.indexOf("async function descargarCV()"), html.indexOf("function cPerfil()"));
  assert.match(html, /class="cv-entry-role"/);
  assert.match(html, /class="cv-entry-company"/);
  assert.match(html, /class="cv-entry-dates"/);
  assert.match(download, /capture\(paper,/);
  assert.match(download, /pdf\.addImage\(image, "PNG", 0, 0, 210, 297/);
  assert.match(download, /pdf\.save\("CV-" \+ filename \+ "\.pdf"\)/);
});

test("los datos personales identificables no se envían a proveedores de IA", () => {
  const start = edgeFunction.indexOf("function profileForAi(");
  const end = edgeFunction.indexOf("function restorePersonalData(", start);
  assert.ok(start >= 0 && end > start, "No se encontró la separación de datos personales");
  const sanitizer = edgeFunction.slice(start, end);
  for (const field of ["name", "email", "phone", "location", "linkedin", "portfolio"]) {
    assert.match(sanitizer, new RegExp(field + ": _"));
  }
  assert.match(sanitizer, /\.\.\.professionalData/);
});


test("la descarga normaliza la foto para conservar su proporción en el PDF", () => {
  const start = html.indexOf("async function descargarCV()");
  const end = html.indexOf("function cPerfil()", start);
  const download = html.slice(start, end);
  assert.match(download, /paper\.querySelector\("\.cv-profile-photo"\)/);
  assert.match(download, /const side = Math\.min\(photo\.naturalWidth, photo\.naturalHeight\)/);
  assert.match(download, /photoContext\.drawImage\(photo, sx, sy, side, side, 0, 0, 512, 512\)/);
  assert.match(download, /photo\.style\.objectFit = "fill"/);
  assert.match(download, /photoOriginal\.src/);
  assert.match(download, /photoOriginal\.style/);
  assert.match(download, /photo\.setAttribute\("src", photoOriginal\.src\)/);
});
