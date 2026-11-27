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
