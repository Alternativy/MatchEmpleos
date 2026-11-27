import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourceFiles = [
  ["index.html", new URL("../index.html", import.meta.url)],
  ["en/index.html", new URL("../en/index.html", import.meta.url)],
];

// Construye la cadena a partir de fragmentos para que la prueba tampoco la introduzca.
const forbiddenText = new RegExp(["ye", "sgn"].join(""), "i");

test("las páginas de la app no contienen la errata de Sign up", async () => {
  for (const [label, url] of sourceFiles) {
    const html = await readFile(url, "utf8");
    assert.doesNotMatch(html, forbiddenText, `${label}: contiene una errata de traducción`);
  }
});
test("las traducciones se aplican en una sola pasada", async () => {
  const html = await readFile(new URL("../en/index.html", import.meta.url), "utf8");
  assert.match(html, /value\.replace\(translationPattern,source=>translationMap\.get\(source\)\)/);
  assert.doesNotMatch(html, /for\(const \[source,target\] of entries\).*result\.split\(source\)\.join\(target\)/);
});

test("una traducción de palabra no modifica coincidencias dentro de palabras inglesas", async () => {
  const html = await readFile(new URL("../en/index.html", import.meta.url), "utf8");
  assert.match(html, /patternSource=source=>/);
  assert.match(html, /(?<!\\\\p\\{L\\}\\\\p\\{N\\}_\\)/);
  const wholeWordSi = new RegExp("(?<![\\\\p{L}\\\\p{N}_])Si(?![\\\\p{L}\\\\p{N}_])", "gu");
  assert.equal("Sign up".replace(wholeWordSi, "Yes"), "Sign up");
  assert.equal("Si tenés".replace(wholeWordSi, "Yes"), "Yes tenés");
});
