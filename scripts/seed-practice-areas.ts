/**
 * Seeds the "What We Try" practice-areas band onto every page that renders it.
 *
 *   npx sanity exec scripts/seed-practice-areas.ts --with-user-token
 *
 * The band was hardcoded in PracticeAreas.astro and rendered identically on all
 * three pages, so each page is seeded with the same copy. They're separate
 * documents from here on and can be worded differently per page.
 *
 * NOTE: these cards are marketing copy and don't match the /practice-areas tree
 * (F2) — migrated verbatim so nothing on the site changes. Reconcile in the
 * Studio, not here.
 *
 * Uses setIfMissing, so it won't overwrite Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const PAGES = ["homePage", "trialExperiencePage", "testimonialsPage"] as const;

const CARDS = [
  {
    _key: "civil",
    icon: "briefcase",
    title: "Complex Civil Litigation",
    desc: "Commercial disputes, business torts, high-value plaintiff and defense work in state and federal courts.",
  },
  {
    _key: "injury",
    icon: "users",
    title: "Complex Personal Injury",
    desc: "Serious injury and wrongful death — catastrophic, high-value cases where the stakes demand real trial experience.",
  },
  {
    _key: "whitecollar",
    icon: "layers",
    title: "White Collar Defense",
    desc: "Fraud, health care fraud, securities violations, financial crimes — federal and state.",
  },
  {
    _key: "federal",
    icon: "columns",
    title: "Federal Criminal Defense",
    desc: "Indictments, federal trials, and appeals before district courts and circuit courts of appeals.",
  },
  {
    _key: "investigations",
    icon: "search",
    title: "Government Investigations",
    desc: "Grand jury matters, DOJ and FBI inquiries, regulatory enforcement actions, and agency investigations.",
  },
  {
    _key: "state",
    icon: "doc",
    title: "State Trials & Appeals",
    desc: "Felony defense in Texas courts, post-conviction relief, and federal and state appellate work.",
  },
].map((c) => ({ ...c, _type: "practiceAreaCard" }));

const BAND = {
  _type: "practiceAreasBand",
  eyebrow: "Practice Areas",
  headingLead: "What We",
  headingStrong: "Try.",
  description:
    "We handle the full range of disputes that demand genuine courtroom ability — complex civil litigation, personal injury, white collar defense, federal criminal matters, and high-stakes state court trials. Our clients come to us when the other side has deep resources, the stakes are real, and the case needs to be tried.",
  cards: CARDS,
};

async function main() {
  console.log(`Seeding practice-areas band into "${client.config().dataset}"…`);

  const tx = client.transaction();
  for (const pageId of PAGES) {
    tx.createIfNotExists({ _id: pageId, _type: pageId });
    tx.patch(pageId, (p) => p.setIfMissing({ practiceAreas: BAND }));
  }
  await tx.commit();

  for (const pageId of PAGES) {
    const n = await client.fetch<number>(
      `count(*[_id == $pageId][0].practiceAreas.cards)`,
      { pageId },
    );
    console.log(`  - ${pageId}: ${n} cards`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
