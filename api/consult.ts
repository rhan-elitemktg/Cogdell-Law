// Serverless function that receives the Consult form and emails the firm via
// Resend. It runs on Vercel's servers — NOT in the visitor's browser — which is
// the whole point: the secret RESEND_API_KEY lives here and never reaches the
// client. The static site is untouched; this file is deployed on its own as a
// function at POST /api/consult.
//
// Env vars (set in Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   — your Resend API key (secret)
//   CONSULT_TO_EMAIL — where leads are sent. Comma-separate for several
//                      recipients: "intake@firm.com, dan@firm.com".
import { Resend } from "resend";

// Hardcoded rather than an env var: this isn't an environment concern, it's a
// property of the domain verified in Resend. It must stay on the `send.`
// subdomain — that is what is verified, not the bare cogdell-law.com — and
// Resend rejects anything else, so a stray dashboard value would break sending
// with nothing in the code to explain why.
const FROM = "Cogdell Law Firm <noreply@send.cogdell-law.com>";

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;

  // One address or several: "a@firm.com, b@firm.com". The `?? ""` keeps an unset
  // var from throwing here rather than at the guard below, and filter(Boolean)
  // drops the empty segment a trailing comma leaves behind.
  // `String(...)` rather than a bare `?? ""`: @types/node isn't installed, so
  // `process.env.X` is `any` and the split/map below would infer `any` too,
  // tripping noImplicitAny under astro's strict tsconfig.
  const recipients = String(process.env.CONSULT_TO_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  // Read the submitted fields (the form posts JSON).
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const phone = (data.phone || "").trim();
  const message = (data.message || "").trim();

  // Honeypot: a hidden field no human sees. If it's filled, it's a bot — quietly
  // report success and send nothing.
  if ((data.company || "").trim()) return json({ ok: true });

  // Server-side validation (never trust the browser alone).
  if (!name || !email) {
    return json({ ok: false, error: "Name and email are required." }, 400);
  }

  // Fail loudly in logs if the function isn't configured, but don't leak details.
  // Tests the parsed list, not the raw string: CONSULT_TO_EMAIL="," is non-empty
  // but yields no usable recipient.
  if (!apiKey || !recipients.length) {
    console.error("Consult form: missing RESEND_API_KEY or CONSULT_TO_EMAIL env var.");
    return json({ ok: false, error: "Email is not configured yet." }, 500);
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: email, // hitting "reply" in the inbox replies to the prospect
      subject: `New consultation request — ${name}`,
      text: [
        `Name:  ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        "",
        "Message:",
        message || "—",
      ].join("\n"),
    });

    if (error) {
      console.error("Resend returned an error:", error);
      return json({ ok: false, error: "Could not send. Please try again." }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Resend threw:", err);
    return json({ ok: false, error: "Could not send. Please try again or call us." }, 502);
  }
}
