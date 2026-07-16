/**
 * One-off: gives the existing `attorney` documents an `orderRank`, in the order
 * the cards were hardcoded before Sanity.
 *
 *   npx sanity exec scripts/backfill-attorney-order.ts --with-user-token
 *
 * Why: attorneys are now drag-to-reorder (D2, @sanity/orderable-document-list),
 * and the card grid sorts by `order(orderRank)`. Documents created before the
 * field existed have no rank, so their order would be arbitrary.
 *
 * Ranks are generated with `lexorank` — the same library the plugin uses — so
 * they interleave correctly when the firm drags a new attorney into place.
 *
 * Idempotent: skips any attorney that already has a rank. Safe to delete once
 * run against every dataset.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";

const client = getCliClient();

/** The order the cards rendered in before the migration: founder first. */
const ORDER = ["cogdell-dan-l", "dennis-aisha-j", "osso-anthony", "newton-brent-e"];

async function main() {
  const docs = await client.fetch<
    Array<{ _id: string; name: string; slug: string; orderRank?: string }>
  >(`*[_type == "attorney"]{_id, name, "slug": slug.current, orderRank}`);

  const unranked = docs.filter((d) => !d.orderRank);
  if (unranked.length === 0) {
    console.log(`All ${docs.length} attorneys already have an orderRank — nothing to do.`);
    return;
  }

  // Anyone not in ORDER goes after those who are, rather than jumping the queue.
  const position = (slug: string) => {
    const i = ORDER.indexOf(slug);
    return i === -1 ? ORDER.length : i;
  };
  const sorted = [...unranked].sort((a, b) => position(a.slug) - position(b.slug));

  console.log(`Ranking ${sorted.length} attorney(s) in "${client.config().dataset}"…`);

  let rank = LexoRank.middle();
  const tx = client.transaction();
  for (const doc of sorted) {
    tx.patch(doc._id, (p) => p.set({ orderRank: rank.toString() }));
    console.log(`  ${rank.toString()}  ${doc.name}`);
    rank = rank.genNext();
  }
  await tx.commit();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
