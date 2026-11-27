import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("el selector público permanece en el footer, alineado con las redes", () => {
  const footerStart = html.indexOf('<footer class="foot lp-footer">');
  const footerEnd = html.indexOf("</footer>", footerStart);
  assert.notEqual(footerStart, -1, "No se encontró el footer de la landing");
  assert.notEqual(footerEnd, -1, "No se encontró el cierre del footer");

  const footer = html.slice(footerStart, footerEnd);
  const socialLinks = footer.indexOf('class="lp-social"');
  const selector = footer.indexOf('class="lp-footer-locale"');
  assert.notEqual(socialLinks, -1, "No se encontró el bloque de redes sociales");
  assert.notEqual(selector, -1, "El selector público debe permanecer dentro del footer");
  assert.ok(selector > socialLinks, "El selector debe aparecer junto al bloque de redes");
  assert.match(footer, /lp-footer-top[\\s\\S]*?lp-social[\\s\\S]*?lp-footer-locale[\\s\\S]*?lp-footer-links/, "El selector debe estar en la fila superior del footer");
  assert.match(html, /\\.landing-v2 \\.lp-footer-locale \\.locale-switcher\\s*\\{[^}]*top:\\s*calc\\(109\\s*\\*\\s*var\\(--u\\)\\)[^}]*right:/, "En escritorio debe conservar su alineación en la landing");
});

test("los paneles de postulantes y empresas incluyen el selector flotante", () => {
  assert.match(html, /function appLocaleSwitcher\\(\\)/, "Debe existir un generador reutilizable del selector para la app");
  assert.match(html, /class="app-locale"[\\s\\S]*?class="locale-switcher"/, "El selector de la app debe tener su contenedor flotante");
  assert.match(html, /return `<div class="app has-nav [\\s\\S]*?\\$\\{dock\\}\\$\\{appLocaleSwitcher\\(\\)\\}<\\/div>`/, "shell() debe incluir el selector tanto para el panel de postulantes como para el de empresas");
  assert.match(html, /\\.app-locale\\s*\\{[^}]*position:\\s*fixed[^}]*right:/, "El selector de los paneles debe permanecer fijo en la esquina inferior derecha");
  assert.match(html, /\\.app-locale \\.locale-menu\\s*\\{[^}]*bottom:\\s*calc\\(100% \\+ 8px\\)/, "El menú debe abrirse hacia arriba para no quedar fuera de pantalla");
});

test("los eventos del selector sobreviven a los re-renderizados", () => {
  assert.match(html, /document\\.addEventListener\\("click",event=>\\{[\\s\\S]*?event\\.target\\.closest\\("\\.locale-switcher"\\)/, "Los eventos deben delegarse en document");
  assert.match(html, /if\\(selected==="en"\\)\\{location\\.assign\\("\/en\/"\\)/, "English debe conservar su navegación a /en/");
  assert.match(html, /if\\(selected==="es"\\)\\{location\\.assign\\("\/"\\)/, "Español debe conservar su navegación a la raíz");
});
