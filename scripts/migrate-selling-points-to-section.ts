/**
 * One-off: reshapes `homePage.sellingPoints` from a bare array into a section
 * object — `[...]` → `{ points: [...] }`.
 *
 *   npx sanity exec scripts/migrate-selling-points-to-section.ts --with-user-token
 *
 * Why: every Home Page section is an `object` with `collapsible: true` so the
 * Studio renders it as an accordion. `collapsible` is an ObjectOptions flag —
 * plain array fields can't collapse — so a list-only section still needs the
 * object wrapper.
 *
 * Preserves the existing items (and any Studio edits) rather than re-seeding.
 * Idempotent, and safe to delete once run against every dataset.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

interface Point {
  _key: string;
  _type: string;
  value: string;
  label: string;
}

async function main() {
  const doc = await client.fetch<{ sellingPoints: Point[] | { points?: Point[] } } | null>(
    `*[_id == "homePage"][0]{sellingPoints}`,
  );

  const current = doc?.sellingPoints;

  if (!current) {
    console.log("homePage has no sellingPoints — nothing to migrate.");
    return;
  }

  if (!Array.isArray(current)) {
    console.log(
      `Already a section object (${current.points?.length ?? 0} point(s)) — nothing to do.`,
    );
    return;
  }

  console.log(`Reshaping ${current.length} point(s) into { points: [...] }…`);
  for (const p of current) console.log(`  - ${p.value} — ${p.label}`);

  await client.patch("homePage").set({ sellingPoints: { points: current } }).commit();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
