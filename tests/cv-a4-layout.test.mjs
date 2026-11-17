import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

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


test("el creador de CV limita cada campo a 4.000 caracteres y muestra su contador individual", () => {
  assert.match(html, /data-cv-char-field="true"/);
  assert.match(html, /maxlength="4000"/);
  assert.ok(html.includes('data-cv-char-counter="${id}"'));
  assert.match(html, /const CV_FIELD_CHAR_LIMIT = 4000/);
  assert.match(html, /cvUpdateCharCounter\(e\.target\)/);
  assert.match(html, /CV_FIELD_CHAR_LIMIT/);
  assert.doesNotMatch(html, /CV_TOTAL_CHAR_LIMIT|cv-char-counter" id="cv-char-counter"/);
});

test("la descarga del CV genera un PDF A4 con jsPDF sin usar la impresión del navegador", () => {
  assert.ok(html.includes('<script src="vendor/jspdf.umd.min.js"></script>'));
  assert.ok(html.includes('new JsPDF({ orientation: "portrait", unit: "mm", format: "a4"'));
  assert.ok(html.includes('pdf.save("CV-" + filename + ".pdf")'));
  const download = html.slice(html.indexOf("function descargarCV()"), html.indexOf("function cPerfil()"));
  assert.equal(download.includes("window.print"), false);
});
