import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MAX_INPUT_BYTES = 24_000;
const MAX_REQUESTS_PER_MINUTE = 4;
const WINDOW_MS = 60_000;
const PROVIDER_TIMEOUT_MS = 25_000;
const requestsByIp = new Map<string, number[]>();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function allowedByRateLimit(req: Request): boolean {
  const ip = req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) return false;
  recent.push(now);
  requestsByIp.set(ip, recent);
  return true;
}

function safeString(value: unknown, max = 2_000): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

function safeList(value: unknown, maxItems = 20, maxLength = 500): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => safeString(item, maxLength)).filter(Boolean);
}

function normalizeProfile(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const p = value as Record<string, unknown>;
  const experience = Array.isArray(p.experience) ? p.experience.slice(0, 12).map((item) => {
    const e = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      role: safeString(e.role, 160),
      company: safeString(e.company, 160),
      location: safeString(e.location, 120),
      dates: safeString(e.dates, 100),
      description: safeString(e.description, 1_200),
      achievements: safeList(e.achievements, 8, 300),
    };
  }) : [];
  const education = Array.isArray(p.education) ? p.education.slice(0, 10).map((item) => {
    const e = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      institution: safeString(e.institution, 180),
      degree: safeString(e.degree, 180),
      location: safeString(e.location, 120),
      dates: safeString(e.dates, 100),
      details: safeString(e.details, 500),
    };
  }) : [];

  const profile = {
    name: safeString(p.name, 160),
    email: safeString(p.email, 180),
    phone: safeString(p.phone, 80),
    location: safeString(p.location, 160),
    linkedin: safeString(p.linkedin, 240),
    portfolio: safeString(p.portfolio, 240),
    targetRole: safeString(p.targetRole, 160),
    professionalSummary: safeString(p.professionalSummary, 1_500),
    experience,
    education,
    skills: safeList(p.skills, 40, 100),
    languages: safeList(p.languages, 12, 120),
    courses: safeList(p.courses, 20, 180),
    certifications: safeList(p.certifications, 20, 180),
    additional: safeString(p.additional, 1_000),
  };
  return JSON.stringify(profile).length <= MAX_INPUT_BYTES ? profile : null;
}

const systemPrompt = [
  "Sos especialista en redacción de CV profesionales para búsquedas laborales en Argentina.",
  "Transformá los datos provistos en contenido para un CV de una página o dos como máximo, estilo Harvard: sobrio, claro, cronológico inverso y compatible con ATS.",
  "No inventes ni infieras nombres, empresas, puestos, fechas, estudios, títulos, certificaciones, herramientas, idiomas, niveles, logros, métricas ni responsabilidades.",
  "Podés mejorar redacción, ortografía y precisión. Convertí tareas explícitas en viñetas de impacto sin agregar resultados no informados.",
  "Si falta un dato, devolvé una cadena vacía o una lista vacía. No uses placeholders ni completes con suposiciones.",
  "Mantené el idioma español rioplatense profesional. Evitá tablas, columnas, íconos, gráficos, barras de nivel, foto y elementos decorativos.",
  "Las palabras clave ATS deben salir únicamente de los datos aportados. No agregues competencias que no estén respaldadas.",
  "Devolvé exclusivamente JSON válido con esta estructura exacta:",
  '{"personal":{"name":"","email":"","phone":"","location":"","linkedin":"","portfolio":""},"target_role":"","professional_summary":"","experience":[{"role":"","company":"","location":"","dates":"","bullets":[]}],"education":[{"institution":"","degree":"","location":"","dates":"","details":""}],"skills":[],"languages":[],"courses":[],"certifications":[],"ats_keywords":[],"additional":""}',
].join(" ");

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function extractJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function validateOutput(value: Record<string, unknown>) {
  const personal = value.personal;
  if (!personal || typeof personal !== "object" || Array.isArray(personal)) return false;
  const p = personal as Record<string, unknown>;
  if (typeof p.name !== "string" || !Array.isArray(value.experience) ||
      !Array.isArray(value.education) || !Array.isArray(value.skills) ||
      !Array.isArray(value.languages) || !Array.isArray(value.ats_keywords)) return false;
  return true;
}

async function generateWithGemini(apiKey: string, profile: object) {
  const response = await fetchWithTimeout(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(profile) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.25, maxOutputTokens: 3_500 },
      }),
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error("provider_unavailable");
  const parts = payload?.candidates?.[0]?.content?.parts;
  const raw = Array.isArray(parts)
    ? parts.map((part: { text?: unknown }) => typeof part?.text === "string" ? part.text : "").join("\n")
    : "";
  const result = extractJson(raw);
  if (!result || !validateOutput(result)) throw new Error("invalid_model_output");
  return result;
}

async function generateWithGroq(apiKey: string, profile: object) {
  const response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(profile) },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 3_500,
      temperature: 0.25,
      reasoning_effort: "low",
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error("provider_unavailable");
  const raw = payload?.choices?.[0]?.message?.content;
  const result = typeof raw === "string" ? extractJson(raw) : null;
  if (!result || !validateOutput(result)) throw new Error("invalid_model_output");
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  if (!req.headers.get("authorization")?.startsWith("Bearer ")) {
    return json({ error: "Tenés que iniciar sesión para generar tu CV." }, 401);
  }
  if (!allowedByRateLimit(req)) {
    return json({ error: "Alcanzaste el límite temporal. Probá nuevamente en un minuto.", code: "rate_limit" }, 429);
  }

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_INPUT_BYTES + 2_000) {
    return json({ error: "Los datos del CV superan el tamaño permitido." }, 413);
  }
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "La solicitud no contiene JSON válido." }, 400);
  }

  const profile = normalizeProfile((body as { profile?: unknown } | null)?.profile);
  if (!profile) return json({ error: "Revisá los datos del CV e intentá nuevamente." }, 400);
  if (!profile.name && !profile.experience.length && !profile.education.length) {
    return json({ error: "Completá al menos tu nombre, experiencia o formación antes de generar el CV." }, 400);
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!geminiKey && !groqKey) return json({ error: "El servicio de IA no está configurado." }, 503);

  try {
    if (geminiKey) {
      try {
        const cv = await generateWithGemini(geminiKey, profile);
        return json({ cv, provider: "gemini" });
      } catch {
        if (!groqKey) throw new Error("generation_failed");
      }
    }
    if (groqKey) {
      const cv = await generateWithGroq(groqKey, profile);
      return json({ cv, provider: "groq" });
    }
    return json({ error: "No pudimos generar el CV. Probá nuevamente." }, 502);
  } catch {
    return json({ error: "No pudimos generar el CV en este momento. Revisá los datos e intentá nuevamente.", code: "generation_failed" }, 502);
  }
});
