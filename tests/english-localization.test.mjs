import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const spanish = await readFile(new URL("../index.html", import.meta.url), "utf8");
const english = await readFile(new URL("../en/index.html", import.meta.url), "utf8");
const spec = await readFile(new URL("../docs/requisitos-localizacion.md", import.meta.url), "utf8");

test("la versión española conserva su idioma y el selector navega a las rutas", () => {
  assert.match(spanish, /<html lang="es-AR">/);
  assert.match(spanish, /location\.assign\("\/en\/"\)/);
  assert.match(spanish, /location\.assign\("\/"\)/);
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
  assert.match(english, /if\(selected==="es"\)\{location\.assign\("\/"\)/);
  assert.match(english, /document\.documentElement\.lang="en"/);
});

test("portugués permanece deshabilitado y el renaming del logo queda documentado", () => {
  assert.match(spanish, /data-locale="pt" role="option" disabled aria-disabled="true"/);
  assert.match(english, /data-locale="pt" role="option" disabled aria-disabled="true"/);
  assert.match(spec, /Renaming del logo: reemplazar la denominación visual actual por \*\*MatchJobs\*\*/);
  assert.match(spec, /El logo gráfico no se modifica en esta implementación/);
});
