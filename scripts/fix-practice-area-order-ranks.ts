/**
 * Re-spaces every practice area's `orderRank` so no two documents share one.
 *
 *   npx sanity exec scripts/fix-practice-area-order-ranks.ts --with-user-token
 *   npx sanity exec scripts/fix-practice-area-order-ranks.ts --with-user-token -- --dry
 *
 * The original seed handed out colliding ranks (13 of 20 documents shared a rank
 * with at least one sibling). Two consequences:
 *
 *  1. @sanity/orderable-document-list paints every duplicate with the `caution`
 *     tone — the yellow rows in the Studio list. Editors read that as "unpublished
 *     changes", which it is not.
 *  2. `order(orderRank)` in src/sanity/lib/practiceAreas.ts has no defined
 *     tiebreak, so the nav and grid order of tied documents is whatever the
 *     database happens to return.
 *
 * The CURRENT displayed order is preserved exactly — this only re-spaces the
 * ranks that produce it. Ranks are LexoRank-formatted (`0|<base36>:`), fixed
 * width so lexicographic order matches numeric order, stepping by 8 the way the
 * plugin's own initial ranks do, leaving room to drag items between them.
 */
import { getCliClient } from "sanity/cli";

const DRY = process.argv.includes("--dry");

const client = getCliClient();
const raw = client.withConfig({ perspective: "raw", apiVersion: "2025-08-15" });

/** LexoRank-style: bucket 0, fixed-width base36 value, empty decimal part. */
const START = parseInt("i00000", 36);
const STEP = 8;
const rankAt = (i: number) => `0|${(START + i * STEP).toString(36).padStart(6, "0")}:`;

interface Area {
  _id: string;
  title: string;
  rank?: string;
  parentId?: string;
}

async function run() {
  const areas: Area[] = await raw.fetch(
    `*[_type == "practiceArea" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]
      { _id, title, "rank": orderRank, "parentId": parent._ref }
     | order(orderRank asc)`,
  );

  // Report collisions before touching anything.
  const counts = new Map<string, number>();
  for (const a of areas) counts.set(a.rank ?? "", (counts.get(a.rank ?? "") ?? 0) + 1);
  const dupes = areas.filter((a) => (counts.get(a.rank ?? "") ?? 0) > 1);

  console.log(`${areas.length} practice areas, ${dupes.length} sharing a rank\n`);

  // Sibling collisions are the ones that actually reorder the live site.
  const bySibling = new Map<string, Area[]>();
  for (const a of areas) {
    const k = a.parentId ?? "(top level)";
    (bySibling.get(k) ?? bySibling.set(k, []).get(k)!).push(a);
  }
  let siblingClashes = 0;
  for (const [, group] of bySibling) {
    const seen = new Set<string>();
    for (const a of group) {
      if (a.rank && seen.has(a.rank)) siblingClashes++;
      if (a.rank) seen.add(a.rank);
    }
  }
  console.log(
    siblingClashes
      ? `⚠ ${siblingClashes} collision(s) BETWEEN SIBLINGS — live nav/grid order was undefined.`
      : `✓ no collisions between siblings — live site order was already stable.\n`,
  );

  const tx = client.transaction();
  areas.forEach((a, i) => {
    const next = rankAt(i);
    console.log(`  ${String(a.rank).padEnd(12)} → ${next.padEnd(12)} ${a.title}`);
    tx.patch(a._id, (p) => p.set({ orderRank: next }));
  });

  if (DRY) {
    console.log("\n--dry: nothing written.");
    return;
  }
  await tx.commit();
  console.log(`\nRe-ranked ${areas.length} practice areas; every rank is now unique.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
