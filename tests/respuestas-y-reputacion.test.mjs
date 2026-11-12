import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const sql = await readFile(new URL("../supabase/sql/respuestas_reputacion_y_cuenta.sql", import.meta.url), "utf8");

// Contratos de la regla central: toda postulación recibe respuesta y el postulante se entera.

test("responder pasa por el servidor para los tres tipos de respuesta", () => {
  assert.match(html, /sb\.rpc\("responder_postulacion", \{ p_id: id, p_tipo: tipo, p_texto: texto \}\)/);
  assert.doesNotMatch(html, /guardarCandidato|actualizarPostulacion|cargarPostulacion/);
  assert.match(sql, /create or replace function public\.responder_postulacion/);
  assert.match(sql, /set estado = 'Respondida'/);
  assert.match(sql, /'\{respuesta\}'/);
  assert.match(sql, /if p_tipo in \('si', 'mas'\) then/);
});

test("el postulante ve el texto de la respuesta y el estado Vista existe", () => {
  assert.match(html, /resp\?\.texto/);
  assert.match(sql, /create or replace function public\.marcar_vista/);
  assert.match(html, /DB\.marcarVista\(id\)/);
});

test("la plantilla de entrevista no propone una cita inventada", () => {
  assert.doesNotMatch(html, /jueves a las 16/);
  assert.match(html, /Completá lo que está entre corchetes antes de enviar/);
});

test("el plazo de respuesta se guarda en cada búsqueda", () => {
  assert.match(sql, /alter table public\.busquedas add column if not exists plazo/);
  assert.match(html, /plazo: b\.plazo \|\| 3/);
  assert.match(html, /plazo: S\.e\.plazo/);
  assert.doesNotMatch(html, /Si no te contesta en 7 días/);
});

test("la tasa es una sola y la calcula el servidor", () => {
  assert.doesNotMatch(html, /function calcTasa|DB\.setTasa/);
  assert.match(html, /sb\.rpc\("reputacion_empresas"/);
  assert.match(sql, /create or replace function public\.reputacion_empresas/);
  assert.match(html, /Empresa nueva/);
});

test("publicar espera al servidor y el servidor bloquea si hay pendientes", () => {
  assert.match(html, /const ok = await DB\.guardarBusqueda\(nb\)/);
  assert.match(sql, /raise exception 'pendientes_sin_responder'/);
});

test("el postulante ya no puede modificar sus postulaciones desde el navegador", () => {
  assert.match(sql, /drop policy if exists "candidato gestiona sus postulaciones"/);
  assert.match(sql, /revoke update on public\.postulaciones from authenticated/);
});

test("el registro no saltea el correo y la confirmación vuelve al mismo sitio", () => {
  assert.doesNotMatch(html, /href="#\/registro\/(c|e)\/1"/);
  assert.match(html, /if \(!\(regDraft\["rg-mail"\] && regDraft\["rg-pass"\]\)\) return registro\(\);/);
  assert.equal((html.match(/emailRedirectTo: location\.origin \+ location\.pathname/g) || []).length, 2);
});

test("la cuenta se puede eliminar desde Configuración", () => {
  assert.match(html, /\["Eliminar mi cuenta", `#\/\$\{kind\}\/eliminar`\]/);
  assert.match(html, /sb\.rpc\("eliminar_mi_cuenta"\)/);
  assert.match(sql, /create or replace function public\.eliminar_mi_cuenta/);
});

test("matches, notificaciones y descartes no dependen de la memoria de la pestaña", () => {
  assert.match(html, /go\("#\/c\/match\/" \+ nuevos\[nuevos\.length - 1\]\)/);
  assert.match(html, /match: ch \? ch\.match !== false : false/);
  assert.match(html, /S\.c\.notifs = construirNotifs\(\)/);
  assert.match(html, /leerSet\("me-descartadas"\)/);
});

test("el ícono y el manifiesto apuntan a sus rutas reales", () => {
  assert.match(html, /<link rel="manifest" href="img\/site\.webmanifest" \/>/);
  assert.match(html, /<link rel="icon" href="favicon\.ico" sizes="any" \/>/);
});

test("un vencimiento superado nunca se presenta como si venciera hoy", () => {
  assert.match(html, /return diferencia <= 0 \? -1 : Math\.ceil\(diferencia \/ DIA_MS\)/);
  assert.match(html, /return q < 0 \? "Plazo vencido"/);
});

test("la baja de cuenta se detiene si Storage no confirma la eliminación", () => {
  assert.match(html, /Promise\.allSettled\(\[/);
  assert.match(html, /r\.status === "rejected" \|\| r\.value\?\.error/);
  assert.match(html, /if \(errorArchivos\)[\s\S]*?Tu cuenta sigue activa/);
  assert.ok(html.indexOf("if (errorArchivos)") < html.indexOf("DB.eliminarCuenta()"));
});


test("la asistencia de IA está disponible en staging y producción", () => {
  assert.doesNotMatch(html, /if \(ENTORNO !== ["']staging["']\) return ["']["'];/);
  assert.match(html, /data-action="mejorar-sobre"/);
  assert.match(html, /sb\.functions\.invoke\(["']mejorar-sobre["']/);
});

test("la landing comunica el cupo correcto de cinco postulaciones semanales", () => {
  assert.match(html, /Tenés 5 postulaciones por semana\./);
  assert.doesNotMatch(html, /Tenés 5 Postulaciones por día\./);
});
