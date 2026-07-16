/**
 * Seeds the Home Page firm-story band with the copy that was hardcoded in
 * FirmStory.astro.
 *
 *   npx sanity exec scripts/seed-firm-story.ts --with-user-token
 *
 * The full-bleed courthouse photo stays in the repo (D6) — it's art direction,
 * and it's the same image the attorney bio heroes use.
 *
 * setIfMissing per field, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const paragraphs = [
  "When the gavel sounds, and the courtroom doors swing open, there's one name that makes the opposition quake in their polished loafers: Cogdell Law Firm. It isn't just a law firm; it's the law firm of choice for people facing charges for federal white collar and criminal offenses, state felony charges, grand jury investigations, medical kickback, securities fraud or criminal appeals.",
  "Dan Cogdell is one of the elite 2% of attorneys admitted to the Fellow American College of Trial Lawyers. His reputation for strategy and skill isn't just respected, it's revered. Mr. Cogdell knows the play before the opposition's even decided on the game. Settlements are his specialty, but should a trial beckon, he's the maestro ready to conduct a legal symphony like no other.",
  "Mr. Cogdell has spent his career collecting acquittals in cases written off by others. Impossible isn't in his lexicon — it's just another word for challenge. He doesn't take cases he thinks he can win; he takes those he knows he will.",
];

const FIRM_STORY = {
  eyebrow: "Why Cogdell Law Firm",
  headingLead: "The Firm the Opposition",
  headingStrong: "Doesn't Want to Face.",
  body: paragraphs.map((text, i) => ({
    _type: "block",
    _key: `p${i + 1}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `p${i + 1}s`, text, marks: [] }],
  })),
  cta: { _type: "ctaButton", label: "About the Firm", href: "/our-firm" },
};

async function main() {
  console.log(`Seeding firm story into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });

  const patch = client.patch("homePage");
  for (const [key, value] of Object.entries(FIRM_STORY)) {
    patch.setIfMissing({ [`firmStory.${key}`]: value });
  }
  await patch.commit();

  const written = await client.fetch<Record<string, unknown>>(
    `*[_id == "homePage"][0].firmStory{eyebrow, headingLead, headingStrong, "bodyBlocks": count(body), "cta": cta.label}`,
  );
  console.log(JSON.stringify(written, null, 2).replace(/^/gm, "  "));
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
