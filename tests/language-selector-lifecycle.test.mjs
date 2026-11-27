import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("el selector de idioma existe una sola vez en el footer, alineado con las redes", () => {
  const footerStart = html.indexOf('<footer class="foot lp-footer">');
  const footerEnd = html.indexOf("</footer>", footerStart);
  assert.notEqual(footerStart, -1, "No se encontró el footer de la landing");
  assert.notEqual(footerEnd, -1, "No se encontró el cierre del footer");

  const footer = html.slice(footerStart, footerEnd);
  const socialLinks = footer.indexOf('class="lp-social"');
  const selector = footer.indexOf('class="lp-footer-locale"');
  assert.notEqual(socialLinks, -1, "No se encontró el bloque de redes sociales");
  assert.notEqual(selector, -1, "El selector debe estar dentro del footer");
  assert.ok(selector > socialLinks, "El selector debe aparecer junto al bloque de redes");
  assert.equal((html.match(/class="locale-switcher"/g) || []).length, 1, "Debe existir una única instancia del selector");
  assert.match(footer, /lp-footer-top[\s\S]*?lp-social[\s\S]*?lp-footer-locale[\s\S]*?lp-footer-links/, "El selector debe estar en la fila superior del footer, junto a redes/contacto");
  assert.match(html, /\.landing-v2 \.lp-footer-locale \.locale-switcher\s*\{[^}]*top:\s*calc\(109\s*\*\s*var\(--u\)\)[^}]*right:/, "En escritorio debe alinearse horizontalmente con los enlaces de redes");
});

test("el selector se vuelve a generar con la landing en cada render y sus eventos sobreviven", () => {
  const renderStart = html.indexOf("function render(keepScroll)");
  assert.notEqual(renderStart, -1, "No se encontró render()");
  const renderEnd = html.indexOf("\n        }", renderStart);
  const render = html.slice(renderStart, renderStart + 1800);

  assert.match(render, /root\.innerHTML\s*=\s*route\(\)\s*\+\s*reportModal\(\)/, "render() reemplaza el contenido del root y debe regenerar la landing");
  assert.match(html, /<div class="lp-footer-locale">[\s\S]*?class="locale-switcher"/, "El selector debe estar incluido en el template HTML de la landing que devuelve route()");
  assert.match(html, /document\.addEventListener\("click",\s*event\s*=>\s*\{[\s\S]*?event\.target\.closest\("\.locale-switcher"\)/, "Los eventos del selector deben delegarse en document y no en un nodo que render() destruya");
});
