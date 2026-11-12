import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const chatAI = await readFile(new URL("../supabase/functions/sugerir-respuestas-chat/index.ts", import.meta.url), "utf8");
const improveAI = await readFile(new URL("../supabase/functions/mejorar-sobre/index.ts", import.meta.url), "utf8");
const reportSql = await readFile(new URL("../supabase/sql/denuncias_y_verificacion_empresas.sql", import.meta.url), "utf8");
const anonymousSql = await readFile(new URL("../supabase/sql/anonymous_sobre_ai_single_use.sql", import.meta.url), "utf8");

// Pruebas estáticas de contratos del código fuente. No sustituyen pruebas E2E.
function section(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, "No se encontró el inicio de " + label);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, "No se encontró el final de " + label);
  return source.slice(start, end);
}

test("el estado inicial no precarga datos ficticios", () => {
  const state = section(html, "function freshState()", "let unreadMessages", "freshState");
  assert.match(state, /ofertas:\s*\[\]/);
  assert.match(state, /posts:\s*\[\]/);
  assert.match(state, /chats:\s*\{\}/);
  assert.match(state, /notifs:\s*\[\]/);
  assert.match(state, /busquedas:\s*\[\]/);
  assert.match(state, /pend:\s*\[\]/);
});

test("la hidratación carga ofertas y postulaciones reales desde Supabase", () => {
  const hydrate = section(html, "async function hidratar()", "/* ---------- Autenticación", "hidratar");
  assert.match(hydrate, /const ofertasReales = d\.busquedas\.filter/);
  assert.match(hydrate, /real:\s*true/);
  assert.match(hydrate, /S\.c\.ofertas = ofertasReales/);
  assert.match(hydrate, /S\.c\.posts = dbPosts/);
  assert.match(hydrate, /S\.e\.busquedas = dbBus/);
  assert.match(hydrate, /S\.c\.cupo = d\.cupo/);
});

test("apply rechaza ofertas no provenientes de Supabase antes de postular", () => {
  const apply = section(html, "async function apply(oid)", "async function sendChat", "apply");
  const guard = apply.indexOf("if (o.real !== true) return;");
  const request = apply.indexOf("DB.postular(post, oid)");
  assert.notEqual(guard, -1);
  assert.notEqual(request, -1);
  assert.ok(guard < request);
  assert.match(apply, /S\.c\.cupo = restante/);
});

test("el frontend no conserva accesos ni perfiles de demostración", () => {
  assert.doesNotMatch(html, /ME\.demo|DEMO_VISIBLE|DEMO_HABILITADO|entrarDemo|data-action=["']demo/);
  assert.doesNotMatch(html, /Café Mercado|Tomás Ferreyra|Farmacia Sur|Supermercado Norte/);
  assert.match(html, /sb\.auth\.signOut\(\)/);
});

test("las rutas privadas exigen una sesión de Supabase", () => {
  assert.match(html, /if \(!ME\.id && a && !PUBLICAS\.includes\(a\)\)/);
  assert.match(html, /sb\.auth\.onAuthStateChange\(/);
  assert.doesNotMatch(html, /DEMO_VISIBLE|DEMO_HABILITADO|ME\.demo/);
});

test("Sobre vos con IA solo se renderiza en staging y comunica el tratamiento del texto", () => {
  const helper = section(html, "function sobreIA(", "function writeHere(", "sobreIA");
  assert.match(helper, /if \(ENTORNO !== "staging"\) return ""/);
  assert.match(helper, /Mejorar con IA/);
  assert.match(helper, /Tu texto se envía al servicio de IA/);
  assert.match(helper, /El perfil no cambia hasta que elijas aplicar la sugerencia/);
  assert.match(helper, /Sugerencia editable/);
  assert.match(helper, /data-action="usar-sobre-ia"/);
});

test("generar una propuesta no reemplaza el original hasta la acción explícita", () => {
  const generation = section(html, "async function mejorarSobre(button)", "function savePub()", "mejorarSobre");
  assert.match(generation, /sb\.functions\.invoke\("mejorar-sobre"/);
  assert.match(generation, /output\.value = data\.improvedText/);
  assert.match(generation, /output\.dataset\.source = texto/);
  assert.match(generation, /Tu texto original sigue intacto/);
  assert.doesNotMatch(generation, /input\.value\s*=\s*data\.improvedText/);
  assert.match(html, /if \(act === "usar-sobre-ia"\)/);
  assert.match(html, /original\.value = suggestion\.value\.trim\(\)/);
  assert.match(html, /suggestion\.dataset\.source !== \(original\.value \|\| ""\)\.trim\(\)/);
});

test("la interfaz informa cuotas dinámicas recibidas del backend", () => {
  assert.match(html, /data\.dailyRemaining/);
  assert.match(html, /data\.monthlyRemaining/);
  assert.match(html, /Te quedan \$\{d\} mejoras hoy y \$\{m\} este mes/);
  assert.match(html, /anonymousRemaining/);
  assert.match(html, /La mejora gratuita para visitantes ya fue utilizada/);
  assert.doesNotMatch(html, /Límite: 5 mejoras por día y 50 por mes/);
});

test("el frontend no contiene claves secretas de proveedores o de Supabase", () => {
  assert.doesNotMatch(html, /GEMINI_API_KEY|GROQ_API_KEY|SUPABASE_SECRET_KEYS|SUPABASE_SERVICE_ROLE_KEY|sk-[A-Za-z0-9_-]{20,}/);
});

test("la interfaz actual no presenta la asistencia IA de chat como integrada", () => {
  assert.doesNotMatch(html, /sugerir-respuestas-chat|generar-respuestas-chat|aiSuggestions/);
  assert.match(chatAI, /Deno\.serve/);
});

test("la Edge Function de chat exige sesión y valida que la empresa sea dueña del chat", () => {
  assert.match(chatAI, /getAuthenticatedUser\(req, supabaseUrl, publishableKey\)/);
  assert.match(chatAI, /if \(!userId\) return json/);
  assert.match(chatAI, /rol: "eq\.e"/);
  const tick = String.fromCharCode(96);
  assert.ok(chatAI.includes("empresa_id: " + tick + "eq.\${userId}" + tick));
  assert.match(chatAI, /if \(!chat\) return json/);
  assert.match(chatAI, /if \(!company\) return json/);
});

test("la Edge Function de chat valida tres sugerencias distintas y admite ambos proveedores", () => {
  assert.match(chatAI, /items\.length === 3/);
  assert.match(chatAI, /new Set\(items\.map/);
  assert.match(chatAI, /suggestions: result\.suggestions/);
  assert.match(chatAI, /GEMINI_API_KEY/);
  assert.match(chatAI, /GROQ_API_KEY/);
});

test("la Edge Function Sobre vos valida sesión o identificador anónimo y reserva cuota", () => {
  assert.match(improveAI, /getAuthenticatedUser\(req, supabaseUrl, publishableKey\)/);
  assert.match(improveAI, /anonymousId/);
  assert.match(improveAI, /reserve_anonymous_ai_usage/);
  assert.match(improveAI, /complete_anonymous_ai_usage/);
  assert.match(improveAI, /reserve_ai_usage/);
  assert.match(improveAI, /complete_ai_usage/);
  assert.match(improveAI, /GEMINI_API_KEY/);
  assert.match(improveAI, /GROQ_API_KEY/);
});

test("el formulario de denuncias contiene los motivos permitidos y limita el mensaje", () => {
  for (const reason of [
    "Es una empresa falsa",
    "Suplantación de identidad",
    "Lenguaje inapropiado",
    "Condiciones Inaceptables",
    "Contenidos obscenos o de odio",
    "Spam o Confuso",
    "Otros",
  ]) assert.ok(html.includes(reason), "Falta motivo: " + reason);
  assert.match(html, /maxlength="2000"/);
  assert.match(html, /data-form="denuncia"/);
});

test("el envío de denuncia vincula empresa, postulación y chat al objetivo seleccionado", () => {
  const submit = section(html, "async function enviarDenuncia(form)", "let S = freshState()", "enviarDenuncia");
  assert.match(submit, /sb\.from\("denuncias"\)\.insert\(payload\)/);
  assert.match(submit, /empresa_id:\s*reportTarget\.empresaId/);
  assert.match(submit, /denunciante_id:\s*ME\.id/);
  assert.match(submit, /postulacion_id:\s*reportTarget\.postId/);
  assert.match(submit, /chat_id:\s*reportTarget\.chatId \|\| null/);
  assert.match(submit, /motivo_otro:\s*motivo === "Otros" \? motivoOtro : null/);
});

test("la política de denuncias delega la autorización en una función privada", () => {
  assert.match(reportSql, /create or replace function private\.puede_denunciar_empresa/i);
  assert.match(reportSql, /perfil\.id = \(select auth\.uid\(\)\)/i);
  assert.match(reportSql, /perfil\.rol = 'c'/i);
  assert.match(reportSql, /b\.empresa_id = p_empresa_id/i);
  assert.match(reportSql, /grant execute on function private\.puede_denunciar_empresa\(uuid, text, text\) to authenticated/i);
  assert.match(reportSql, /private\.puede_denunciar_empresa\(empresa_id, postulacion_id, chat_id\)/i);
});

test("la verificación pública es de solo lectura y se sincroniza desde revisiones privadas", () => {
  assert.match(reportSql, /create table if not exists public\.empresas_verificadas/i);
  assert.match(reportSql, /revoke all on public\.empresas_verificadas from anon, authenticated/i);
  assert.match(reportSql, /grant select on public\.empresas_verificadas to authenticated/i);
  assert.match(reportSql, /create table if not exists private\.empresa_verificacion_revisiones/i);
  assert.match(reportSql, /alter table private\.empresa_verificacion_revisiones enable row level security/i);
  assert.match(reportSql, /after insert or update of estado, revisado_at/i);
  assert.match(html, /empresas_verificadas/);
  assert.match(html, /verified-mark/);
});

test("el uso anónimo de IA queda en tabla privada con RLS y RPC exclusivas de service_role", () => {
  assert.match(anonymousSql, /create table if not exists private\.anonymous_ai_usage/i);
  assert.match(anonymousSql, /alter table private\.anonymous_ai_usage enable row level security/i);
  assert.match(anonymousSql, /revoke all on table private\.anonymous_ai_usage from public, anon, authenticated/i);
  assert.match(anonymousSql, /revoke all on function public\.reserve_anonymous_ai_usage\(text\) from public, anon, authenticated/i);
  assert.match(anonymousSql, /revoke all on function public\.complete_anonymous_ai_usage\(text, boolean\) from public, anon, authenticated/i);
  assert.match(anonymousSql, /grant execute on function public\.reserve_anonymous_ai_usage\(text\) to service_role/i);
  assert.match(anonymousSql, /grant execute on function public\.complete_anonymous_ai_usage\(text, boolean\) to service_role/i);
});
