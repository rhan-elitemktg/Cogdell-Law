/**
 * Seeds the "Why Choose" band onto the two pages that render it.
 *
 *   npx sanity exec scripts/seed-why-choose.ts --with-user-token
 *
 * The band was hardcoded in WhyChoose.astro and rendered identically on both
 * pages, so each is seeded with the same copy. They're separate documents from
 * here on and can be worded differently per page (D11).
 *
 * The full-bleed boardroom photo stays in the repo (D6) — it's art direction.
 *
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const PAGES = ["homePage", "attorneysPage"] as const;

const FEATURES = [
  {
    _key: "trial",
    icon: "trophy",
    title: "Trial-First Approach",
    body: "Insurance companies and prosecutors settle because they know we will try the case. That changes everything.",
  },
  {
    _key: "reach",
    icon: "landmark",
    title: "National Reach",
    body: "Licensed and experienced in federal courts across the country. Your case isn't limited by geography.",
  },
  {
    _key: "record",
    icon: "check",
    title: "Proven Track Record",
    body: "Over 500 jury trials. Exposed corruption, won acquittals, and secured landmark verdicts.",
  },
  {
    _key: "personal",
    icon: "shield",
    title: "Accessible & Personal",
    body: "Dan Cogdell personally handles every case. No hand-offs to junior associates.",
  },
].map((f) => ({ ...f, _type: "whyChooseFeature" }));

const BAND = {
  _type: "whyChooseBand",
  eyebrow: "The Cogdell Difference",
  headingLead: "Why Choose",
  headingStrong: "Cogdell Law Firm.",
  features: FEATURES,
};

async function main() {
  console.log(`Seeding "Why Choose" into "${client.config().dataset}"…`);

  const tx = client.transaction();
  for (const pageId of PAGES) {
    tx.createIfNotExists({ _id: pageId, _type: pageId });
    tx.patch(pageId, (p) => p.setIfMissing({ whyChoose: BAND }));
  }
  await tx.commit();

  for (const pageId of PAGES) {
    const n = await client.fetch<number>(`count(*[_id == $pageId][0].whyChoose.features)`, { pageId });
    console.log(`  - ${pageId}: ${n} cards`);
  }
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
