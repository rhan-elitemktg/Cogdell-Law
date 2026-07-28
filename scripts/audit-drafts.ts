/**
 * Diagnostic: non-published document versions + practice-area orderRank health.
 *
 *   npx sanity exec scripts/audit-drafts.ts --with-user-token
 *
 * Must run under the `raw` perspective — the client's default (`drafts`)
 * overlays drafts onto published docs and strips the `drafts.` prefix from
 * `_id`, so `*[_id in path("drafts.**")]` silently returns nothing.
 */
import { getCliClient } from "sanity/cli";

const raw = getCliClient().withConfig({ perspective: "raw", apiVersion: "2025-08-15" });

async function run() {
  const docs: { _id: string; _type: string; _updatedAt: string; title?: string }[] =
    await raw.fetch(
      `*[_id in path("drafts.**") || _id in path("versions.**")]
        { _id, _type, _updatedAt, title } | order(_updatedAt desc)`,
    );

  const drafts = docs.filter((d) => d._id.startsWith("drafts."));
  const versions = docs.filter((d) => d._id.startsWith("versions."));

  console.log(`drafts: ${drafts.length}`);
  for (const d of drafts) console.log(`  ${d._type.padEnd(16)} ${d.title ?? "(untitled)"}`);
  console.log(`release versions: ${versions.length}\n`);

  const areas: { _id: string; title: string; rank?: string }[] = await raw.fetch(
    `*[_type == "practiceArea" && !(_id in path("drafts.**"))]
      { _id, title, "rank": orderRank }`,
  );

  const ranked = areas.filter((a) => a.rank);
  const unranked = areas.filter((a) => !a.rank);

  console.log(`practiceArea: ${areas.length} published, ${ranked.length} with orderRank, ${unranked.length} WITHOUT\n`);

  console.log("with orderRank (custom order):");
  for (const a of [...ranked].sort((x, y) => (x.rank! < y.rank! ? -1 : 1))) {
    console.log(`  ${String(a.rank).padEnd(14)} ${a.title}`);
  }
  console.log("\nWITHOUT orderRank (fall to the end, alphabetical):");
  for (const a of [...unranked].sort((x, y) => x.title.localeCompare(y.title))) {
    console.log(`  ${"—".padEnd(14)} ${a.title}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
