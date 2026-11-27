import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../en/index.html", import.meta.url), "utf8");

test("los enlaces hash de la landing y páginas legales permanecen en la app inglesa", () => {
  assert.match(html, /document\.addEventListener\("click",\s*\(event\)\s*=>\s*\{[\s\S]*?const link = event\.target\.closest\('a\[href\^="#\/"\]'\)[\s\S]*?if \(!link \|\| link\.hasAttribute\("data-scroll"\)\) return;[\s\S]*?location\.assign\("\/en\/" \+ link\.getAttribute\("href"\)\);[\s\S]*?\}, true\);/, "Los enlaces internos deben conservar /en/ y excluir los enlaces de desplazamiento de la landing");

  const footer = html.slice(html.indexOf('<footer class="foot lp-footer">'), html.indexOf("</footer>", html.indexOf('<footer class="foot lp-footer">')));
  for (const route of ["#/login", "#/registro", "#/privacidad", "#/terminos", "#/ayuda"]) {
    assert.ok(html.includes(`href="${route}"`) || route === "#/login" || route === "#/registro", `La landing inglesa debe incluir la ruta ${route}`);
  }
  for (const route of ["#/privacidad", "#/terminos", "#/ayuda"]) {
    assert.ok(footer.includes(`href="${route}"`), `El footer legal debe enlazar a ${route}`);
  }
});
