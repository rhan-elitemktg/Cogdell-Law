/**
 * One-off: converts `homePage.about.body` from an array of plain strings into
 * `blockContent` (Portable Text).
 *
 *   npx sanity exec scripts/migrate-about-body-to-blockcontent.ts --with-user-token
 *
 * Why: `about.body` was modelled as plain text before D12 set `blockContent` as
 * the standard for every body-copy field, so the SEO team can add headings,
 * links and bold consistently. This brings the one pre-D12 prose field in line.
 *
 * Each string becomes one `normal` block — no formatting is invented, so the
 * rendered output is unchanged.
 *
 * Idempotent: skips if the value is already Portable Text. Safe to delete once
 * run against every dataset.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const toBlock = (text: string, i: number) => ({
  _type: "block",
  _key: `p${i + 1}`,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `p${i + 1}s`, text, marks: [] }],
});

async function main() {
  const body = await client.fetch<unknown[] | null>(
    `*[_id == "homePage"][0].about.body`,
  );

  if (!body?.length) {
    console.log("homePage.about.body is empty — nothing to migrate.");
    return;
  }

  if (typeof body[0] !== "string") {
    console.log(
      `Already Portable Text (${body.length} block(s)) — nothing to do.`,
    );
    return;
  }

  const strings = body as string[];
  console.log(`Converting ${strings.length} paragraph(s) to blockContent…`);
  for (const s of strings) console.log(`  - ${s.slice(0, 68)}…`);

  await client
    .patch("homePage")
    .set({ "about.body": strings.map(toBlock) })
    .commit();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
