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
