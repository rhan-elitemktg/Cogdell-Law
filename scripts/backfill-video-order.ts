/**
 * One-off: gives existing `video` documents an `orderRank`, in the order they
 * appeared in data/videos.ts (the order /videos showed before Sanity).
 *
 *   npx sanity exec scripts/backfill-video-order.ts --with-user-token
 *
 * Idempotent: skips videos that already have a rank. Safe to delete once run.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";

const client = getCliClient();

// The order the videos were listed in data/videos.ts.
const ORDER = ["out2hqx46o", "lkdv454x6f", "035chk0v0i", "5e2vhej9xk", "ltmlnegnid"];

async function main() {
  const docs = await client.fetch<Array<{ _id: string; wistiaId: string; orderRank?: string }>>(
    `*[_type == "video"]{_id, wistiaId, orderRank}`,
  );
  const unranked = docs.filter((d) => !d.orderRank);
  if (!unranked.length) {
    console.log(`All ${docs.length} videos already ranked — nothing to do.`);
    return;
  }
  const pos = (id: string) => {
    const i = ORDER.indexOf(id);
    return i === -1 ? ORDER.length : i;
  };
  const sorted = [...unranked].sort((a, b) => pos(a.wistiaId) - pos(b.wistiaId));

  let rank = LexoRank.middle();
  const tx = client.transaction();
  for (const d of sorted) {
    tx.patch(d._id, (p) => p.set({ orderRank: rank.toString() }));
    console.log(`  ${rank.toString()}  ${d.wistiaId}`);
    rank = rank.genNext();
  }
  await tx.commit();
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
