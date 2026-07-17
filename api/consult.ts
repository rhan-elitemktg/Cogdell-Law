// Serverless function that receives the Consult form and emails the firm via
// Resend. It runs on Vercel's servers — NOT in the visitor's browser — which is
// the whole point: the secret RESEND_API_KEY lives here and never reaches the
// client. The static site is untouched; this file is deployed on its own as a
// function at POST /api/consult.
//
// Env vars (set in Vercel → Settings → Environment Variables):
//   RESEND_API_KEY     — your Resend API key (secret)
//   CONSULT_TO_EMAIL   — where leads are sent. In Resend test mode this MUST be
//                        the email you signed up to Resend with.
//   CONSULT_FROM_EMAIL — optional. Defaults to Resend's test sender. Change to a
//                        verified address (e.g. "Cogdell Law <website@cogdell-law.com>")
//                        once the domain is verified.
import { Resend } from "resend";

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONSULT_TO_EMAIL;
  const from =
    process.env.CONSULT_FROM_EMAIL || "Cogdell Law Website <onboarding@resend.dev>";

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
  if (!apiKey || !to) {
    console.error("Consult form: missing RESEND_API_KEY or CONSULT_TO_EMAIL env var.");
    return json({ ok: false, error: "Email is not configured yet." }, 500);
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
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
