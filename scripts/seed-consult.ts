/**
 * Seeds the site-wide Consult band, plus the one page that overrides its copy.
 *
 *   npx sanity exec scripts/seed-consult.ts --with-user-token
 *
 * The band renders on 13 pages, most of them dynamic routes with no page
 * document — so it's one shared record with optional per-page overrides (D13).
 *
 * /contact overrode the heading and body via props in the page file; that copy
 * moves to contactPage.consult so it's editable. /our-firm only overrode the
 * photo, which stays a prop (art direction, D6) — so it gets no override here.
 *
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const para = (text: string) => [
  {
    _type: "block",
    _key: "p1",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "p1s", text, marks: [] }],
  },
];

const FINEPRINT = "Attorney-client privilege applies from your first communication with us.";
const THANK_YOU =
  "Thank you — Dan Cogdell and our team will review your inquiry personally and be in touch shortly.";

/** The component's own defaults — what 11 of the 13 pages render. */
const SHARED = {
  _type: "consultContent",
  eyebrow: "Confidential",
  headingLead: "Schedule Your",
  headingStrong: "Consultation.",
  body: para(
    "Tell us about your case. Dan Cogdell and our team review every inquiry personally — your conversation is privileged and confidential.",
  ),
  fineprint: FINEPRINT,
  thankYou: THANK_YOU,
};

/** What contact.astro passed as props. */
const CONTACT_OVERRIDE = {
  _type: "consultContent",
  eyebrow: "Confidential",
  headingLead: "Tell Us About",
  headingStrong: "Your Case.",
  body: para(
    "Dan Cogdell and our team review every inquiry personally. Your conversation is privileged and confidential from the very first message.",
  ),
  fineprint: FINEPRINT,
  thankYou: THANK_YOU,
};

async function main() {
  console.log(`Seeding Consult into "${client.config().dataset}"…`);

  await client
    .transaction()
    .createIfNotExists({ _id: "consult", _type: "consult" })
    .patch("consult", (p) => p.setIfMissing({ content: SHARED }))
    .createIfNotExists({ _id: "contactPage", _type: "contactPage" })
    .patch("contactPage", (p) => p.setIfMissing({ consult: CONTACT_OVERRIDE }))
    .createIfNotExists({ _id: "ourFirmPage", _type: "ourFirmPage" })
    .commit();

  for (const [id, path] of [
    ["consult", "content"],
    ["contactPage", "consult"],
  ] as const) {
    const got = await client.fetch(
      `*[_id == $id][0].${path}{headingLead, headingStrong}`,
      { id },
    );
    console.log(`  - ${id}.${path}: ${JSON.stringify(got)}`);
  }
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
