/**
 * One-off: converts remaining plain-string prose fields to `blockContent`.
 *
 *   npx sanity exec scripts/migrate-prose-to-blockcontent.ts --with-user-token
 *
 *   homePage.hero.lead
 *   homePage.practiceAreas.description
 *   trialExperiencePage.practiceAreas.description
 *   testimonialsPage.practiceAreas.description
 *
 * Why: D12 makes `blockContent` the standard for every body-copy field so the
 * SEO team gets headings, links and bold consistently. These predate it.
 *
 * The practice-areas band exists on three pages, each with its own copy (D11) —
 * so all three need converting, not just the homepage.
 *
 * Each string becomes one `normal` block; no formatting is invented, so the
 * rendered output is unchanged. Idempotent: skips fields already converted.
 * Safe to delete once run against every dataset.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const TARGETS: Array<{ id: string; path: string }> = [
  { id: "homePage", path: "hero.lead" },
  { id: "homePage", path: "practiceAreas.description" },
  { id: "trialExperiencePage", path: "practiceAreas.description" },
  { id: "testimonialsPage", path: "practiceAreas.description" },
];

const toBlocks = (text: string) => [
  {
    _type: "block",
    _key: "p1",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "p1s", text, marks: [] }],
  },
];

async function main() {
  console.log(`Converting prose fields in "${client.config().dataset}"…`);
  let changed = 0;

  for (const { id, path } of TARGETS) {
    const value = await client.fetch<unknown>(`*[_id == $id][0].${path}`, { id });

    if (value == null) {
      console.log(`  · ${id}.${path} — absent, skipped`);
      continue;
    }
    if (typeof value !== "string") {
      console.log(`  · ${id}.${path} — already Portable Text`);
      continue;
    }

    await client.patch(id).set({ [path]: toBlocks(value) }).commit();
    console.log(`  ✓ ${id}.${path} — "${value.slice(0, 46)}…"`);
    changed++;
  }

  console.log(`Done — ${changed} field(s) converted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
