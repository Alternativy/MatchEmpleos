import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const spec = await readFile(new URL("../docs/requisitos-localizacion.md", import.meta.url), "utf8");

test("la especificación conserva la URL y el comportamiento actuales del español", () => {
  assert.match(spec, /versión en español conservará su URL actual/i);
  assert.match(spec, /no cambiará su comportamiento de navegación/i);
  assert.match(spec, /La página española conservará su comportamiento SEO actual/i);
});

test("la especificación exige prefijos de idioma en producción y en previews", () => {
  assert.match(spec, /Inglés: `\/en\/`/);
  assert.match(spec, /Portugués: `\/pt\/`/);
  assert.match(spec, /https:\/\/matchempleos\.com\.ar\/en\//);
  assert.match(spec, /https:\/\/deploy-preview-23--matchempleos\.netlify\.app\/en\//);
  assert.match(spec, /funcionar tanto en producción como en los deploy previews de Netlify/i);
});

test("las páginas traducidas deben quedar fuera del índice de buscadores", () => {
  assert.match(spec, /páginas localizadas distintas de español no deberán ser indexadas/i);
  assert.match(spec, /directiva de no indexación/i);
  assert.match(spec, /meta robots o una cabecera equivalente/i);
  assert.match(spec, /no se deberá agregar una directiva de no indexación a la versión española/i);
});

test("la revisión editorial de traducciones IA queda para una etapa posterior", () => {
  assert.match(spec, /traducciones iniciales podrán generarse con IA/i);
  assert.match(spec, /revisión y corrección de la redacción localizada queda fuera de esta etapa/i);
  assert.match(spec, /más personas dentro de Argentina/i);
});

test("la especificación incluye criterios de aceptación verificables", () => {
  for (const criterion of [
    "La URL española actual permanece sin cambios",
    "La versión inglesa se sirve en",
    "Los prefijos localizados funcionan en producción y en previews de Netlify",
    "Todas las páginas localizadas no españolas emiten una directiva de no indexación",
    "La versión española no recibe esa directiva",
  ]) {
    assert.ok(spec.includes(criterion), `Falta criterio de aceptación: ${criterion}`);
  }
});

const englishPage = await readFile(new URL("../en/index.html", import.meta.url), "utf8");

test("la landing inglesa incluye los títulos localizados pendientes", () => {
  assert.match(englishPage, /<h2 id="quienes-titulo">Who we are<\/h2>/);
  assert.match(englishPage, /<h2 id="cta-titulo">The future won’t wait\. Neither should you!<\/h2>/);
});

test("el nombre Match Empleos se conserva en el footer inglés", () => {
  assert.match(englishPage, /2026 - Match Empleos - All rights reserved\./);
  assert.doesNotMatch(englishPage, /2026 - Match Jobs - All rights reserved\./);
});

test("la estadística de desempleo en inglés se ajusta al ancho de su tarjeta", () => {
  assert.match(englishPage, /<p>Unemployment among people aged 14–29, with an overall rate of 7\.5%\.<\/p>/);
  assert.match(englishPage, /\.landing-v2 \.lp-stat:first-child p\s*\{[^}]*white-space: normal;[^}]*overflow-wrap: break-word;/s);
});
