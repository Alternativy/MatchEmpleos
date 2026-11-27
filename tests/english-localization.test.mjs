import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const spanish = await readFile(new URL("../index.html", import.meta.url), "utf8");
const english = await readFile(new URL("../en/index.html", import.meta.url), "utf8");
const spec = await readFile(new URL("../docs/requisitos-localizacion.md", import.meta.url), "utf8");

function assertLocaleNavigation(html, label) {
  assert.match(html, /data-locale="es" role="option"/, `${label}: opción español`);
  assert.match(html, /data-locale="en" role="option"/, `${label}: opción inglés`);
  assert.match(html, /if\(selected==="en"\|\|selected==="es"\)/, `${label}: solo admite los idiomas disponibles`);
  assert.match(html, /const localePath=selected==="en"\?"\/en\/"\:"\/"\;/, `${label}: asigna la ruta según el idioma`);
  assert.match(html, /location\.assign\(localePath\+location\.search\+location\.hash\)/, `${label}: conserva query y hash`);
  assert.doesNotMatch(html, /data-locale="pt"/, `${label}: portugués ya no aparece como opción`);
}

test("la versión española conserva idioma y navegación del selector", () => {
  assert.match(spanish, /<html lang="es-AR">/);
  assertLocaleNavigation(spanish, "versión española");
});

test("la versión inglesa se sirve en /en/ con recursos desde la raíz", () => {
  assert.match(english, /<html lang="en">/);
  assert.match(english, /<base href="\/">/);
  assert.match(english, /canonical" href="https:\/\/matchempleos\.com\.ar\/en\//);
});

test("la página inglesa incluye noindex desde el HTML inicial", () => {
  assert.match(english, /<meta name="robots" content="noindex, nofollow">/);
});

test("la página inglesa incluye traducciones y navegación de vuelta al español", () => {
  assert.match(english, /Welcome to Match Jobs/);
  assert.match(english, /Your next opportunity starts with a MATCH/);
  assertLocaleNavigation(english, "versión inglesa");
  assert.match(english, /document\.documentElement\.lang="en"/);
});

test("el panel inglés mantiene sus rutas hash dentro de /en/", () => {
  assert.match(english, /link=event\.target\.closest\('a\[href\^="#\/"\]'\)/);
  assert.match(english, /if\s*\(\s*!link\s*\|\|\s*link\.hasAttribute\("data-scroll"\)\s*\)\s*return;/);
  assert.match(english, /location\.assign\("\/en\/"\s*\+\s*link\.getAttribute\("href"\)\)/);
});

test("el renaming del logo queda documentado", () => {
  assert.match(spec, /Renaming del logo: reemplazar la denominación visual actual por \*\*MatchJobs\*\*/);
  assert.match(spec, /El logo gráfico no se modifica en esta implementación/);
});
