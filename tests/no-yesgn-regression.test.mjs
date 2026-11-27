import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourceFiles = [
  ["index.html", new URL("../index.html", import.meta.url)],
  ["en/index.html", new URL("../en/index.html", import.meta.url)],
];

test("las páginas de la app no contienen el error tipográfico Yesgn", async () => {
  for (const [label, url] of sourceFiles) {
    const html = await readFile(url, "utf8");
    assert.doesNotMatch(html, /yesgn/i, `${label}: no debe aparecer "Yesgn"`);
  }
});
