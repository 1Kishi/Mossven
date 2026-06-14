/**
 * Mossven contact-form worker.
 * Serves the static Astro build (ASSETS) and handles POST /api/contact:
 *   1. validates the payload against the D1 CHECK constraints
 *   2. verifies the Cloudflare Turnstile token (if a secret is configured)
 *   3. inserts the lead into `contact_submissions`
 *   4. sends a notification email via Resend (best-effort)
 */

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  FROM_EMAIL?: string;
  NOTIFY_EMAIL?: string;
  PRIVACY_POLICY_VERSION?: string;
}

// Allowed enum values — must stay in sync with the contact_submissions CHECK constraints.
const NEEDS = ["new_website", "website_care", "existing_care", "other"] as const;
const BUDGETS = ["under_15000", "15000_30000", "30000_50000", "unknown"] as const;
const TIMINGS = ["asap", "within_month", "two_three_months", "researching"] as const;
const CONTACTS = ["phone", "email"] as const;
const LANGS = ["cs", "en"] as const;

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function bad(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: JSON_HEADERS,
  });
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function inSet<T extends readonly string[]>(v: string, set: T): v is T[number] {
  return (set as readonly string[]).includes(v);
}

function toBool01(v: unknown): 0 | 1 {
  return v === true || v === 1 || v === "1" || v === "yes" || v === "ano" ? 1 : 0;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | null,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function sendNotification(env: Env, lead: Record<string, unknown>): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const from = env.FROM_EMAIL || "Mossven <leads@mossven.com>";
  const to = env.NOTIFY_EMAIL || "jacobfuturegreen@gmail.com";
  const lines = [
    `Jméno / Name: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `Telefon: ${lead.phone || "—"}`,
    `Co potřebuje / Need: ${lead.need}`,
    `Rozpočet / Budget: ${lead.budget}`,
    `Termín / Timing: ${lead.project_timing}`,
    `Má web: ${lead.has_website ? "ano" : "ne"}  |  Má doménu: ${lead.has_domain ? "ano" : "ne"}`,
    `Současný web: ${lead.current_url || "—"}`,
    `Preferovaný kontakt: ${lead.preferred_contact}`,
    `Jazyk: ${lead.language}`,
    "",
    `Zpráva / Message:`,
    `${lead.message || "—"}`,
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: String(lead.email),
        subject: `Nová poptávka: ${lead.name} (${lead.need})`,
        text: lines,
      }),
    });
  } catch {
    // Email is best-effort; the lead is already stored.
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Neplatný formát požadavku.");
  }

  // --- Required text fields ---
  const name = str(payload.name);
  const email = str(payload.email);
  if (name.length < 2 || name.length > 120) return bad("Zadejte prosím jméno.");
  if (email.length < 5 || email.length > 254 || !email.includes("@"))
    return bad("Zadejte prosím platný e-mail.");

  // --- Enums ---
  const need = str(payload.need);
  const budget = str(payload.budget);
  const project_timing = str(payload.project_timing);
  const preferred_contact = str(payload.preferred_contact) || "phone";
  const language = str(payload.language) || "cs";
  if (!inSet(need, NEEDS)) return bad("Neplatná hodnota: need.");
  if (!inSet(budget, BUDGETS)) return bad("Neplatná hodnota: budget.");
  if (!inSet(project_timing, TIMINGS)) return bad("Neplatná hodnota: timing.");
  if (!inSet(preferred_contact, CONTACTS)) return bad("Neplatná hodnota: contact.");
  if (!inSet(language, LANGS)) return bad("Neplatná hodnota: language.");

  // --- Optional fields ---
  const phone = str(payload.phone).slice(0, 40) || null;
  const current_url = str(payload.current_url).slice(0, 500) || null;
  const message = str(payload.message).slice(0, 3000) || null;
  const has_website = toBool01(payload.has_website);
  const has_domain = toBool01(payload.has_domain);

  // --- Consent (required to be 1) ---
  if (toBool01(payload.consent_given) !== 1)
    return bad("Pro odeslání je nutný souhlas se zpracováním údajů.");
  const consent_text = str(payload.consent_text) || "Souhlas se zpracováním údajů za účelem odpovědi na poptávku.";

  // --- Turnstile ---
  const ip = request.headers.get("CF-Connecting-IP");
  let turnstile_verified = 0;
  if (env.TURNSTILE_SECRET_KEY) {
    const token = str(payload.turnstile) || str(payload["cf-turnstile-response"]);
    const ok = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);
    if (!ok) return bad("Ověření proti spamu se nezdařilo. Zkuste to prosím znovu.");
    turnstile_verified = 1;
  }

  // --- Metadata ---
  const id = crypto.randomUUID();
  const ip_hash = ip ? (await sha256Hex(ip)).slice(0, 128) : null;
  const user_agent = (request.headers.get("User-Agent") || "").slice(0, 500) || null;
  const referrer = (request.headers.get("Referer") || str(payload.referrer)).slice(0, 500) || null;
  const utm_source = str(payload.utm_source).slice(0, 120) || null;
  const utm_medium = str(payload.utm_medium).slice(0, 120) || null;
  const utm_campaign = str(payload.utm_campaign).slice(0, 120) || null;
  const privacy_policy_version = env.PRIVACY_POLICY_VERSION || "v1";

  try {
    await env.DB.prepare(
      `INSERT INTO contact_submissions (
        id, language, name, email, phone, need, budget, project_timing,
        has_website, has_domain, current_url, preferred_contact, message,
        consent_given, consent_text, privacy_policy_version, turnstile_verified,
        ip_hash, user_agent, referrer, utm_source, utm_medium, utm_campaign
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
      .bind(
        id, language, name, email, phone, need, budget, project_timing,
        has_website, has_domain, current_url, preferred_contact, message,
        1, consent_text, privacy_policy_version, turnstile_verified,
        ip_hash, user_agent, referrer, utm_source, utm_medium, utm_campaign,
      )
      .run();
  } catch (err) {
    console.error("D1 insert failed", err);
    return bad("Poptávku se nepodařilo uložit. Zkuste to prosím později.", 500);
  }

  await sendNotification(env, {
    name, email, phone, need, budget, project_timing,
    has_website, has_domain, current_url, preferred_contact, message, language,
  });

  return new Response(JSON.stringify({ ok: true, id }), {
    status: 201,
    headers: JSON_HEADERS,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return bad("Method not allowed.", 405);
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
