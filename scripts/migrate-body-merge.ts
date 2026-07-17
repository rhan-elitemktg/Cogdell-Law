/**
 * One-off: merges `intro` + `sections[]` into a single `body` blockContent field
 * on legalPage / practiceArea / locationPage.
 *
 *   npx sanity exec scripts/migrate-body-merge.ts --with-user-token
 *
 * The firm asked for one "Body Content" field instead of an intro plus separate
 * sections. Each section's heading becomes an H2 block at the top of its content,
 * so the rendered page is unchanged.
 *
 * Idempotent: skips docs that already have `body` and no `intro`/`sections`.
 * Safe to delete once run against every dataset.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const h2 = (text: string, key: string) => ({
  _type: "block",
  _key: key,
  style: "h2",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
});

async function main() {
  const docs = await client.fetch<
    Array<{ _id: string; _type: string; title?: string; intro?: any[]; sections?: any[] }>
  >(`*[_type in ["legalPage","practiceArea","locationPage"] && (defined(intro) || defined(sections))]{
      _id, _type, title, intro, sections
    }`);

  if (!docs.length) {
    console.log("Nothing to merge — all docs already use a single body.");
    return;
  }

  console.log(`Merging intro+sections → body on ${docs.length} doc(s)…`);
  for (const doc of docs) {
    const body: any[] = [...(doc.intro ?? [])];
    (doc.sections ?? []).forEach((sec, i) => {
      body.push(h2(sec.heading, `${doc._id.slice(0, 8)}-h${i}`));
      body.push(...(sec.body ?? []));
    });

    await client
      .patch(doc._id)
      .set({ body })
      .unset(["intro", "sections"])
      .commit();
    console.log(`  ${doc._type.padEnd(13)} ${doc.title ?? doc._id}  → ${body.length} blocks`);
  }
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
