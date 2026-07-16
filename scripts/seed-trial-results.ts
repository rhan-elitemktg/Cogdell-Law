/**
 * Seeds the 16 `trialResult` documents, and wires the two pages that show them:
 *   - Home Page  → About section features 6 (the short teasers)
 *   - Trial Experience → shows all 16, in order
 *
 * Source: scripts/data/trial-results.seed.json — a snapshot merged from the two
 * hardcoded arrays that used to live in TrialResults.astro (16 full write-ups)
 * and About.astro (6 short teasers). The teaser copy is attached to its matching
 * case, so each verdict is now one record.
 *
 *   npx sanity exec scripts/seed-trial-results.ts --with-user-token
 *
 * Cases are matched on `name`, so re-running updates rather than duplicating.
 * Page ref-lists use setIfMissing and won't clobber Studio edits.
 */
import { getCliClient } from "sanity/cli";
import seed from "./data/trial-results.seed.json";

const client = getCliClient();

interface SeedCase {
  key: string;
  name: string;
  outcome: string;
  note: string;
  category: string;
  categoryLabel: string;
  order: number;
  teaser?: { title: string; outcome: string; note: string };
  featuredOrder?: number;
}

const cases = seed as SeedCase[];

async function upsertCases() {
  const ids = new Map<string, string>();

  for (const c of cases) {
    // Look up by name — document ids are Sanity's to generate.
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "trialResult" && name == $name][0]{_id}`,
      { name: c.name },
    );

    const doc = {
      _type: "trialResult",
      name: c.name,
      outcome: c.outcome,
      note: c.note,
      category: c.category,
      categoryLabel: c.categoryLabel,
      ...(c.teaser ? { teaser: c.teaser } : {}),
    };

    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
      ids.set(c.name, existing._id);
      console.log(`  = updated: ${c.name}`);
    } else {
      const created = await client.create(doc);
      ids.set(c.name, created._id);
      console.log(`  + created: ${c.name}${c.teaser ? "  (+teaser)" : ""}`);
    }
  }

  return ids;
}

const ref = (id: string, key: string) => ({ _type: "reference", _ref: id, _key: key });

async function wirePages(ids: Map<string, string>) {
  // Trial Experience shows every case, in the order they were hardcoded.
  const all = [...cases]
    .sort((a, b) => a.order - b.order)
    .map((c) => ref(ids.get(c.name)!, c.key));

  // The homepage features the six that carry teaser copy.
  const featured = cases
    .filter((c) => c.teaser)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    .map((c) => ref(ids.get(c.name)!, c.key));

  await client
    .transaction()
    .createIfNotExists({ _id: "trialExperiencePage", _type: "trialExperiencePage" })
    .patch("trialExperiencePage", (p) =>
      p.setIfMissing({ trialResults: { _type: "trialResultList", cases: all } }),
    )
    .commit();
  console.log(`  trialExperiencePage: ${all.length} cases`);

  await client
    .transaction()
    .createIfNotExists({ _id: "homePage", _type: "homePage" })
    .patch("homePage", (p) => p.setIfMissing({ "about.featured": featured }))
    .commit();
  console.log(`  homePage.about.featured: ${featured.length} cases`);
}

async function main() {
  console.log(`Seeding trial results into "${client.config().dataset}"…`);
  const ids = await upsertCases();
  console.log("Wiring pages:");
  await wirePages(ids);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
