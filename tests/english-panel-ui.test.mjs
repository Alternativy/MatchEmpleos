import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../en/index.html", import.meta.url), "utf8");

test("the English panels translate selectable options and report-dialog UI", () => {
  assert.match(html, /const panelUiTranslations = \{/);
  for (const [source, target] of [
    ["Es una empresa falsa", "This is a fake company"],
    ["Suplantación de identidad", "Identity theft or impersonation"],
    ["Condiciones Inaceptables", "Unacceptable conditions"],
    ["Sin experiencia", "No experience"],
    ["Indistinto", "Any level"],
    ["Presencial", "On-site"],
    ["Fin de semana", "Weekend"],
    ["Rotativo", "Rotating"],
    ["Todas las búsquedas", "All job posts"],
    ["Pausada", "Paused"],
    ["Editar datos personales", "Edit personal details"],
    ["Editar datos de la empresa", "Edit company details"],
    ["Generar CV con IA", "Generate resume with AI"],
  ]) {
    assert.ok(html.includes(`"${source}":"${target}"`), `Missing English translation: ${source}`);
  }
});

test("relative dates and response deadlines are generated in English", () => {
  assert.match(html, /if \(dias <= 0\) return "today"/);
  assert.match(html, /return "yesterday"/);
  assert.match(html, /days ago/);
  assert.match(html, /return q < 0 \? "Deadline passed"/);
  assert.match(html, /new Intl\.DateTimeFormat\("en-US"/);
});
