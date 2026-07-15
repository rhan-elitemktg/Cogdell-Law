/**
 * Seeds the Home Page selling-points bar with the content that was hardcoded in
 * SellingPoints.astro.
 *
 *   npx sanity exec scripts/seed-selling-points.ts --with-user-token
 *
 * Values come from the component's old `defaultPoints` — i.e. what the live site
 * actually renders — NOT from the earlier Sanity model, which had these four but
 * misspelled "Experience" as "Experiance"
 * (see docs/_backups/homePage.pre-migration.json).
 *
 * Uses setIfMissing, so it won't overwrite Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const SELLING_POINTS = [
  { _key: "years", value: "40+", label: "Years of Trial Experience" },
  { _key: "courts", value: "Nationwide", label: "Federal & State Courts" },
  { _key: "elite", value: "Elite", label: "Top 2% of Trial Lawyers" },
  { _key: "consult", value: "Confidential", label: "Free Case Evaluation" },
].map((p) => ({ ...p, _type: "sellingPoint" }));

async function main() {
  console.log(`Seeding selling points into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });

  const result = await client
    .patch("homePage")
    .setIfMissing({ sellingPoints: { points: SELLING_POINTS } })
    .commit();

  const section = result.sellingPoints as { points?: typeof SELLING_POINTS } | undefined;
  for (const p of section?.points ?? []) console.log(`  - ${p.value} — ${p.label}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
