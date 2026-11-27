import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const spec = await readFile(new URL("../docs/requisitos-localizacion.md", import.meta.url), "utf8");

test("la especificación conserva la URL y el comportamiento actuales del español", () => {
  assert.match(spec, /versión en español conservará su URL actual/i);
  assert.match(spec, /no cambiará su comportamiento de navegación/i);
  assert.match(spec, /La versión española conservará su comportamiento SEO actual/i);
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
