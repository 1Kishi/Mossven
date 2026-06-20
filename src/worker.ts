/**
 * Mossven contact-form worker.
 *
 * Handles:
 *   1. POST /api/contact
 *   2. payload validation
 *   3. optional Cloudflare Turnstile verification
 *   4. D1 insert into contact_submissions
 *   5. Resend notification email
 *   6. static Astro site serving through Worker assets
 */

interface Env {
  SITE: Fetcher;
  DB: D1Database;

  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;

  FROM_EMAIL?: string;
  NOTIFY_EMAIL?: string;
  PRIVACY_POLICY_VERSION?: string;
}

type EmailResult = {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  body?: string;
  error?: string;
};

const NEEDS = ["new_website", "website_care", "existing_care", "other"] as const;
const BUDGETS = ["under_15000", "15000_30000", "30000_50000", "unknown"] as const;
const TIMINGS = ["asap", "within_month", "two_three_months", "researching"] as const;
const CONTACTS = ["phone", "email"] as const;
const LANGS = ["cs", "en"] as const;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function bad(message: string, status = 400): Response {
  return json({ ok: false, error: message }, status);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function inSet<T extends readonly string[]>(value: string, set: T): value is T[number] {
  return (set as readonly string[]).includes(value);
}

function toBool01(value: unknown): 0 | 1 {
  return value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "yes" ||
    value === "ano"
    ? 1
    : 0;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

  if (ip) {
    body.append("remoteip", ip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      },
    );

    const data = (await response.json()) as { success?: boolean };

    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

async function sendNotification(
  env: Env,
  lead: Record<string, unknown>,
): Promise<EmailResult> {
  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing. Email was not sent.");

    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY is missing",
    };
  }

  const from = env.FROM_EMAIL || "Mossven <leads@mossven.com>";
  const to = env.NOTIFY_EMAIL || "jacobworkgreen@gmail.com";

  const lines = [
    `Nová poptávka z webu Mossven`,
    ``,
    `Jméno / Name: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `Telefon: ${lead.phone || "neuvedeno"}`,
    `Co potřebuje / Need: ${lead.need}`,
    `Rozpočet / Budget: ${lead.budget}`,
    `Termín / Timing: ${lead.project_timing}`,
    `Má web: ${lead.has_website ? "ano" : "ne"}`,
    `Má doménu: ${lead.has_domain ? "ano" : "ne"}`,
    `Současný web: ${lead.current_url || "neuvedeno"}`,
    `Preferovaný kontakt: ${lead.preferred_contact}`,
    `Jazyk: ${lead.language}`,
    ``,
    `Zpráva / Message:`,
    `${lead.message || "neuvedeno"}`,
  ].join("\n");

  const html = `
    <h2>Nová poptávka z webu Mossven</h2>

    <p><strong>Jméno:</strong> ${escapeHtml(String(lead.name || ""))}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(String(lead.email || ""))}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(String(lead.phone || "neuvedeno"))}</p>
    <p><strong>Co potřebuje:</strong> ${escapeHtml(String(lead.need || ""))}</p>
    <p><strong>Rozpočet:</strong> ${escapeHtml(String(lead.budget || ""))}</p>
    <p><strong>Termín:</strong> ${escapeHtml(String(lead.project_timing || ""))}</p>
    <p><strong>Má web:</strong> ${lead.has_website ? "ano" : "ne"}</p>
    <p><strong>Má doménu:</strong> ${lead.has_domain ? "ano" : "ne"}</p>
    <p><strong>Současný web:</strong> ${escapeHtml(String(lead.current_url || "neuvedeno"))}</p>
    <p><strong>Preferovaný kontakt:</strong> ${escapeHtml(String(lead.preferred_contact || ""))}</p>
    <p><strong>Jazyk:</strong> ${escapeHtml(String(lead.language || ""))}</p>

    <hr />

    <p><strong>Zpráva:</strong></p>
    <p>${escapeHtml(String(lead.message || "neuvedeno")).replace(/\n/g, "<br>")}</p>
  `;

  try {
    console.log("Sending email through Resend...");
    console.log("From:", from);
    console.log("To:", to);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: String(lead.email),
        subject: `Nová poptávka: ${lead.name} (${lead.need})`,
        text: lines,
        html,
      }),
    });

    const responseBody = await response.text();

    console.log("Resend status:", response.status);
    console.log("Resend body:", responseBody);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        body: responseBody,
        error: "Resend returned an error",
      };
    }

    return {
      ok: true,
      status: response.status,
      body: responseBody,
    };
  } catch (error) {
    console.error("Resend fetch failed:", error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Neplatný formát požadavku.");
  }

  const name = str(payload.name);
  const email = str(payload.email);

  if (name.length < 2 || name.length > 120) {
    return bad("Zadejte prosím jméno.");
  }

  if (email.length < 5 || email.length > 254 || !email.includes("@")) {
    return bad("Zadejte prosím platný e-mail.");
  }

  const need = str(payload.need);
  const budget = str(payload.budget);
  const project_timing = str(payload.project_timing);
  const preferred_contact = str(payload.preferred_contact) || "phone";
  const language = str(payload.language) || "cs";

  if (!inSet(need, NEEDS)) {
    return bad("Neplatná hodnota: need.");
  }

  if (!inSet(budget, BUDGETS)) {
    return bad("Neplatná hodnota: budget.");
  }

  if (!inSet(project_timing, TIMINGS)) {
    return bad("Neplatná hodnota: timing.");
  }

  if (!inSet(preferred_contact, CONTACTS)) {
    return bad("Neplatná hodnota: contact.");
  }

  if (!inSet(language, LANGS)) {
    return bad("Neplatná hodnota: language.");
  }

  const phone = str(payload.phone).slice(0, 40) || null;
  const current_url = str(payload.current_url).slice(0, 500) || null;
  const message = str(payload.message).slice(0, 3000) || null;

  const has_website = toBool01(payload.has_website);
  const has_domain = toBool01(payload.has_domain);

  if (toBool01(payload.consent_given) !== 1) {
    return bad("Pro odeslání je nutný souhlas se zpracováním údajů.");
  }

  const consent_text =
    str(payload.consent_text) ||
    "Souhlas se zpracováním údajů za účelem odpovědi na poptávku.";

  const ip = request.headers.get("CF-Connecting-IP");

  let turnstile_verified = 0;

  if (env.TURNSTILE_SECRET_KEY) {
    const token =
      str(payload.turnstile) ||
      str(payload["cf-turnstile-response"]);

    const verified = await verifyTurnstile(
      token,
      env.TURNSTILE_SECRET_KEY,
      ip,
    );

    if (!verified) {
      return bad("Ověření proti spamu se nezdařilo. Zkuste to prosím znovu.");
    }

    turnstile_verified = 1;
  }

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
        id,
        language,
        name,
        email,
        phone,
        need,
        budget,
        project_timing,
        has_website,
        has_domain,
        current_url,
        preferred_contact,
        message,
        consent_given,
        consent_text,
        privacy_policy_version,
        turnstile_verified,
        ip_hash,
        user_agent,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        language,
        name,
        email,
        phone,
        need,
        budget,
        project_timing,
        has_website,
        has_domain,
        current_url,
        preferred_contact,
        message,
        1,
        consent_text,
        privacy_policy_version,
        turnstile_verified,
        ip_hash,
        user_agent,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
      )
      .run();
  } catch (error) {
    console.error("D1 insert failed:", error);

    return bad(
      "Poptávku se nepodařilo uložit. Zkuste to prosím později.",
      500,
    );
  }

  const emailResult = await sendNotification(env, {
    name,
    email,
    phone,
    need,
    budget,
    project_timing,
    has_website,
    has_domain,
    current_url,
    preferred_contact,
    message,
    language,
  });

  if (!emailResult.ok) {
    console.error("Email notification failed:", emailResult);
  }

  return json(
    {
      ok: true,
      id,
      email_sent: emailResult.ok,
      email_status: emailResult.status || null,
      email_error: emailResult.ok ? null : emailResult.error || "Email failed",
    },
    201,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return bad("Method not allowed.", 405);
      }

      return handleContact(request, env);
    }

    return env.SITE.fetch(request);
  },
};