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
import { checkBotId } from "botid/server";

// Hardcoded rather than an env var: this isn't an environment concern, it's a
// property of the domain verified in Resend. It must stay on the `send.`
// subdomain — that is what is verified, not the bare cogdell-law.com — and
// Resend rejects anything else, so a stray dashboard value would break sending
// with nothing in the code to explain why.
const FROM = "Cogdell Law Firm <noreply@send.cogdell-law.com>";

// Whether a BotID verdict of "bot" actually turns anyone away.
//
// **Observe-only until someone sets `BOTID_ENFORCE=true` in Vercel**, and that
// default is deliberate rather than lazy. This function cannot be exercised
// locally — `astro dev` doesn't run `api/`, and BotID returns `isBot: false` in
// development regardless — so the first time this code meets a real browser is
// in production, on the firm's only inbound lead path. If the client-side
// challenge fails to load for someone (a hardened browser, an aggressive content
// blocker — and a criminal-defense practice draws more of those than most sites),
// `checkBotId()` reports them as a bot. Enforcing that on day one would silently
// bin real enquiries.
//
// So: ship it observing, read a day of real classifications in the logs, then
// set the variable. Forgetting leaves the site unprotected, which is recoverable;
// the opposite default fails toward lost clients, which isn't.
//
// It doubles as the emergency switch — an env change plus a redeploy, rather
// than a code change, a review, a merge and a deploy.
const ENFORCE_BOTID = String(process.env.BOTID_ENFORCE ?? "") === "true";

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
  // report success and send nothing. Kept alongside BotID rather than replaced by
  // it: it costs nothing, needs no JavaScript, and catches the crude scripted
  // posts before we spend a BotID call on them.
  if ((data.company || "").trim()) return json({ ok: true });

  // Vercel BotID — an invisible challenge solved in the visitor's browser, whose
  // result rides along on this request's headers. The `initBotId()` call in
  // ConsultForm.astro is what marks this route as protected and attaches them;
  // drop that and every check here fails, so the two must stay in step.
  //
  // `checkLevel: "basic"` matches the client and pins us to the free tier —
  // Deep Analysis is $1 per 1000 calls and must also be enabled in the dashboard,
  // so naming the level in both places means switching it on there can't quietly
  // start billing this endpoint.
  try {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: "basic" },
    });

    // While observing, log EVERY verdict rather than only the bot ones.
    // Silence would otherwise be ambiguous: "no bots have tried" and "the check
    // never ran" produce identical logs, and telling those two apart is the
    // entire purpose of the observation window. Once enforcing, this goes quiet
    // and only flagged requests are logged.
    if (!ENFORCE_BOTID) {
      console.info(
        `Consult form: BotID observed isBot=${verification.isBot} ` +
          `isHuman=${verification.isHuman} verifiedBot=${verification.isVerifiedBot} ` +
          `bypassed=${verification.bypassed} — observe mode, nothing blocked.`,
      );
    }

    if (verification.isBot) {
      console.warn(
        `Consult form: BotID flagged a submission (enforcing=${ENFORCE_BOTID}, ` +
          `verifiedBot=${verification.isVerifiedBot}, bypassed=${verification.bypassed}).`,
      );

      // A 403, not a silent `{ ok: true }` like the honeypot. The form's error
      // branch tells the visitor to call 713-426-2244, so a false positive still
      // reaches the firm by phone — whereas a fake thank-you would strand a real
      // client who believes they've made contact. Denying a bot the satisfaction
      // of knowing it was caught is worth less than that.
      if (ENFORCE_BOTID) {
        return json(
          { ok: false, error: "Could not send. Please try again or call us." },
          403,
        );
      }
    }
  } catch (err) {
    // Fail OPEN, on purpose. If BotID is misconfigured, rate-limited or simply
    // down, the worst case of letting the message through is some spam in an
    // inbox; the worst case of the alternative is a law firm's contact form
    // quietly rejecting everyone because of an outage in a bot checker.
    console.error("Consult form: BotID check failed, allowing submission:", err);
  }

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
