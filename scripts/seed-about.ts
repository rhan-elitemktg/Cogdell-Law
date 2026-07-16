/**
 * Seeds the Home Page About section with the copy that was hardcoded in
 * About.astro. The featured case references are seeded separately, by
 * scripts/seed-trial-results.ts.
 *
 *   npx sanity exec scripts/seed-about.ts --with-user-token
 *
 * The pull quote becomes Portable Text. Its two highlighted phrases carry a
 * leading space *inside* the accent span in the original markup
 * (`<span class="about__quote-accent"> unwinnable</span>`), so the spans are
 * split to reproduce the same rendered text exactly.
 *
 * setIfMissing per field, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const span = (key: string, text: string, accent = false) => ({
  _type: "span",
  _key: key,
  text,
  marks: accent ? ["accent"] : [],
});

const QUOTE = [
  {
    _type: "block",
    _key: "quote",
    style: "normal",
    markDefs: [],
    children: [
      span("a", "Sought-after advocates for the cases others call"),
      span("b", " unwinnable", true),
      span("c", " — with"),
      span("d", " 40+ years", true),
      span("e", " of courtroom victories behind every defense."),
    ],
  },
];

const ABOUT = {
  eyebrow: "Texas Criminal Defense Lawyer",
  titleLead: "Four Decades of",
  titleStrong: "High-Profile Victories",
  body: [
    "Dan Cogdell has spent more than 40 years trying complex cases in courtrooms across Texas and the nation. Named one of the state’s best lawyers by the Texas Tribune and recognized by Texas Monthly, he has built a practice defined by high-profile wins in cases others deemed unwinnable.",
    "His acquittal of a defendant in the Enron trial remains a landmark in white-collar defense, while his victory in the Waco/Branch Davidian prosecution cemented his reputation as a trial lawyer willing to take on the government at its most aggressive.",
    "Today, the firm focuses on complex civil disputes, catastrophic personal injury, federal criminal defense, and government investigations — always with the same philosophy: prepare every case for trial, and try it to win.",
  ],
  resultsEyebrow: "Notable Results",
  quote: QUOTE,
};

async function main() {
  console.log(`Seeding About section into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });

  // Field-by-field so this composes with seed-trial-results.ts, which owns
  // `about.featured` — a whole-object setIfMissing would fight it.
  const patch = client.patch("homePage");
  for (const [key, value] of Object.entries(ABOUT)) {
    patch.setIfMissing({ [`about.${key}`]: value });
  }
  await patch.commit();

  const written = await client.fetch<Record<string, unknown>>(
    `*[_id == "homePage"][0].about{eyebrow, titleLead, titleStrong, "paras": count(body), resultsEyebrow, "featured": count(featured), "quoteSpans": count(quote[0].children)}`,
  );
  console.log(JSON.stringify(written, null, 2).replace(/^/gm, "  "));
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
