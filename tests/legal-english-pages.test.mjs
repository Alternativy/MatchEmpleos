import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const english = await readFile(new URL("../en/index.html", import.meta.url), "utf8");
const legalStart = english.indexOf("const LEGAL =");
const legalEnd = english.indexOf("\n        };\n\n        /* ---------- Estado inicial", legalStart);
assert.notEqual(legalStart, -1, "No se encontró el objeto LEGAL");
assert.notEqual(legalEnd, -1, "No se encontró el cierre del objeto LEGAL");
const legal = english.slice(legalStart, legalEnd);
const termsStart = legal.indexOf("terminos: {");
const helpStart = legal.indexOf("ayuda: {", termsStart);
assert.notEqual(termsStart, -1, "No se encontró la página de términos");
assert.notEqual(helpStart, -1, "No se encontró la página de ayuda");
const terms = legal.slice(termsStart, helpStart);
const help = legal.slice(helpStart);

test("la página inglesa de términos está traducida íntegramente", () => {
  assert.match(terms, /titulo: "Terms and Conditions"/);
  assert.match(terms, /Welcome to Match Empleos/);
  assert.match(terms, /Creating an account/);
  assert.match(terms, /You can submit 5 applications per week/);
  assert.match(terms, /Response commitment/);
  assert.match(terms, /If you have any questions, contact us at matchempleos@gmail\.com/);
  assert.doesNotMatch(terms, /Bienvenido|Términos y Condiciones|Si buscás|Tenés|Escribinos/);
});

test("la página inglesa de ayuda está traducida íntegramente", () => {
  assert.match(help, /titulo: "Help Center"/);
  assert.match(help, /How can we help you\?/);
  assert.match(help, /How do I create my profile\?/);
  assert.match(help, /Why is there a limit on the number of applications I can submit\?/);
  assert.match(help, /How do I publish a job listing\?/);
  assert.match(help, /Found a problem\?/);
  assert.doesNotMatch(help, /¿En qué podemos ayudarte|Si buscás|Registrate|Tenés|Escribinos/);
});

test("las páginas traducidas siguen usando las rutas públicas y la vista legal compartida", () => {
  assert.match(english, /if \(a === "privacidad" \|\| a === "terminos" \|\| a === "ayuda"\) return legalSite\(a\)/);
  assert.match(english, /case "legal":\s*return legalApp\("c", c\)/);
  assert.match(english, /case "legal":\s*return legalApp\("e", c\)/);
});
