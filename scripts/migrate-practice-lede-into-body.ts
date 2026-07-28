/**
 * Folds each practice area's `lede` into the top of its `body`, then drops the
 * field.
 *
 *   npx sanity exec scripts/migrate-practice-lede-into-body.ts --with-user-token
 *
 * `lede` used to be a separate field that the catch-all route synthesized into a
 * leading paragraph block at render time — so editors had to keep two fields in
 * sync for what is really one opening paragraph. This writes that same block
 * into `body` for real, so "Body Content" is the whole page.
 *
 * The block written here is identical to the one [...slug].astro used to build
 * on the fly (a `normal` block, one span, no marks), so nothing on the page
 * moves. The lede's other job — the meta description fallback — passes to
 * `cardSummary`.
 *
 * Idempotent: only touches docs that still have a `lede`, and unsets it in the
 * same patch, so a second run is a no-op.
 */
import { getCliClient } from "sanity/cli";
import { randomUUID } from "node:crypto";

const client = getCliClient();

interface Doc {
  _id: string;
  title?: string;
  lede?: string;
  body?: unknown[];
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function run() {
  const docs: Doc[] = await client.fetch(
    `*[_type == "practiceArea" && defined(lede)]{ _id, title, lede, body }`,
  );

  if (!docs.length) {
    console.log("Nothing to migrate — no practice area still has a `lede`.");
    return;
  }

  const tx = client.transaction();

  for (const doc of docs) {
    const lede = doc.lede!.trim();
    const ledeBlock = {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: lede, marks: [] }],
    };

    tx.patch(doc._id, (p) =>
      p.set({ body: [ledeBlock, ...(doc.body ?? [])] }).unset(["lede"]),
    );

    console.log(
      `  ${doc.title}: +1 opening block (${lede.length} chars) → ${(doc.body ?? []).length + 1} blocks`,
    );
  }

  await tx.commit();
  console.log(`\nMigrated ${docs.length} practice areas.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
