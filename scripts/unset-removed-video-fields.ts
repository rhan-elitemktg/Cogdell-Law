/**
 * One-off: strips fields that have been removed from the `video` schema.
 *
 *   npx sanity exec scripts/unset-removed-video-fields.ts --with-user-token
 *
 * `duration` and `poster` are no longer stored — Wistia is the source of truth
 * for both, read at build time (src/lib/wistia.ts, D8). Sanity keeps field data
 * even after a field leaves the schema, and the Studio then flags it as an
 * unknown field, so clear it out.
 *
 * Safe to re-run, and safe to delete once run against every dataset.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const REMOVED_FIELDS = ["duration", "poster"];

async function main() {
  const filter = REMOVED_FIELDS.map((f) => `defined(${f})`).join(" || ");
  const docs = await client.fetch<Array<{ _id: string; title: string }>>(
    `*[_type == "video" && (${filter})]{_id, title}`,
  );

  if (docs.length === 0) {
    console.log("No video documents carry removed fields — nothing to do.");
    return;
  }

  console.log(
    `Unsetting [${REMOVED_FIELDS.join(", ")}] on ${docs.length} video(s) in "${client.config().dataset}"…`,
  );

  // One transaction so it's all-or-nothing.
  const tx = docs.reduce(
    (t, doc) => t.patch(doc._id, (p) => p.unset(REMOVED_FIELDS)),
    client.transaction(),
  );
  await tx.commit();

  for (const doc of docs) console.log(`  - ${doc.title}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
