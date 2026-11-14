import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const sql = await readFile(new URL("../supabase/sql/respuestas_reputacion_y_cuenta.sql", import.meta.url), "utf8");

function section(start, end) {
  const from = html.indexOf(start);
  assert.notEqual(from, -1, `No se encontró el inicio: ${start}`);
  const to = html.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `No se encontró el final: ${end}`);
  return html.slice(from, to);
}

test("usuario ya registrado: login autentica, carga su perfil y entra según su rol", () => {
  const login = section("async function iniciarSesionForm()", "let ultimoCorreo =");
  const session = section("async function setSesion(session)", "document.addEventListener(\"db-error\"");

  assert.match(login, /sb\.auth\.signInWithPassword\(\{ email, password \}\)/);
  assert.match(login, /await setSesion\(data\.session\)/);
  assert.match(login, /go\(ME\.rol === \"e\" \? \"#\/e\/panel\" : \"#\/c\/feed\"\)/);
  assert.match(login, /email_not_confirmed/);
  assert.match(login, /finally[\s\S]*?btn\.disabled = false/);

  assert.match(session, /\.from\(\"perfiles\"\)[\s\S]*?\.select\(\"rol,nombre,datos,avatar_url\"\)/);
  assert.match(session, /await hidratar\(\)/);
  assert.match(session, /if \(!ME\.rol\)[\s\S]*?await sb\.auth\.signOut\(\)/);
});

test("usuario nuevo: el registro crea la cuenta con perfil y redirección al mismo entorno", () => {
  const signup = section("async function crearCuenta(kind)", "async function recuperarForm()");

  assert.match(signup, /sb\.auth\.signUp\(\{[\s\S]*?email,[\s\S]*?password/);
  assert.match(signup, /emailRedirectTo: location\.origin \+ location\.pathname/);
  assert.match(signup, /data: \{ rol: kind, nombre, display_name: nombre, full_name: nombre, datos: perfilDatos\(\) \}/);
  assert.match(signup, /already registered/i);
  assert.match(signup, /if \(data\.session\)[\s\S]*?go\(kind === \"e\" \? \"#\/e\/panel\" : \"#\/c\/feed\"\)/);
  assert.match(signup, /else[\s\S]*?go\(\"#\/confirmar\"\)/);
});

test("usuario nuevo: un registro sin sesión no habilita el acceso antes de confirmar el correo", () => {
  const signup = section("async function crearCuenta(kind)", "async function recuperarForm()");
  const confirmation = section("function confirmar()", "function nuevaClave()");

  assert.match(signup, /if \(data\.session\)[\s\S]*?else[\s\S]*?go\(\"#\/confirmar\"\)/);
  assert.match(confirmation, /Te enviamos un enlace para confirmar tu cuenta/);
  assert.match(confirmation, /Ya confirmé, iniciar sesión/);
});

test("eliminar cuenta: cancelar la confirmación no ejecuta operaciones destructivas", () => {
  const deletion = section("async function eliminarCuenta(btn)", "function legalApp(");

  assert.ok(deletion.indexOf("if (!window.confirm(") < deletion.indexOf("Promise.allSettled"));
  assert.match(deletion, /if \(!window\.confirm\([\s\S]*?\)\) return;/);
});

test("eliminar cuenta: si falla la limpieza de Storage, la cuenta permanece activa", () => {
  const deletion = section("async function eliminarCuenta(btn)", "function legalApp(");

  assert.match(deletion, /Promise\.allSettled\(\[/);
  assert.match(deletion, /sb\.storage\.from\(\"cvs\"\)\.remove/);
  assert.match(deletion, /sb\.storage\.from\(\"avatars\"\)\.remove/);
  assert.match(deletion, /if \(errorArchivos\)[\s\S]*?Tu cuenta sigue activa/);
  assert.ok(deletion.indexOf("if (errorArchivos)") < deletion.indexOf("DB.eliminarCuenta()"));
});

test("eliminar cuenta: si falla la función del servidor, no se limpia la sesión local", () => {
  const deletion = section("async function eliminarCuenta(btn)", "function legalApp(");

  assert.match(deletion, /const ok = await DB\.eliminarCuenta\(\)/);
  assert.match(deletion, /if \(!ok\)[\s\S]*?No pudimos eliminar tu cuenta/);
  assert.ok(deletion.indexOf("if (!ok)") < deletion.indexOf('localStorage.removeItem'));
  assert.ok(deletion.indexOf("if (!ok)") < deletion.indexOf('sb.auth.signOut'));
});

test("eliminar cuenta: solo tras confirmar la baja se revoca la sesión y se vuelve al inicio", () => {
  const deletion = section("async function eliminarCuenta(btn)", "function legalApp(");

  assert.match(deletion, /await sb\.auth\.signOut\(\{ scope: \"local\" \}\)/);
  assert.match(deletion, /ME = \{ id: null, rol: null, nombre: null, email: null, datos: \{\}, avatarUrl: null \}/);
  assert.match(deletion, /S = freshState\(\)/);
  assert.match(deletion, /go\(\"#\/\"\)/);
  assert.match(sql, /create or replace function public\.eliminar_mi_cuenta/);
  assert.match(sql, /auth\.uid\(\)/);
});
