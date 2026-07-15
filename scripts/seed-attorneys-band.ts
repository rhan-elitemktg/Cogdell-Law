/**
 * Seeds the attorney band's header copy (eyebrow, heading, lede) onto the two
 * pages that render it. The cards come from `attorney` documents and are not
 * seeded here.
 *
 *   npx sanity exec scripts/seed-attorneys-band.ts --with-user-token
 *
 * The band was hardcoded in Attorneys.astro and rendered identically on both
 * pages, so each is seeded with the same copy. They're separate documents from
 * here on and can be worded differently per page (D11).
 *
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const PAGES = ["homePage", "attorneysPage"] as const;

const BAND = {
  _type: "attorneysBand",
  eyebrow: "The Firm",
  headingLead: "Trial Lawyers",
  headingStrong: "Who Fight to Win.",
  lede: [
    {
      _type: "block",
      _key: "p1",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "p1s",
          marks: [],
          text: "The Cogdell Law Firm team defends individuals, executives, and companies throughout Texas and across the country — federal investigations, white collar matters, complex civil disputes, and the cases other firms turn away.",
        },
      ],
    },
  ],
};

async function main() {
  console.log(`Seeding attorneys band into "${client.config().dataset}"…`);

  const tx = client.transaction();
  for (const pageId of PAGES) {
    tx.createIfNotExists({ _id: pageId, _type: pageId });
    tx.patch(pageId, (p) => p.setIfMissing({ attorneys: BAND }));
  }
  await tx.commit();

  for (const pageId of PAGES) {
    const got = await client.fetch<{ headingLead?: string } | null>(
      `*[_id == $pageId][0].attorneys{headingLead, headingStrong}`,
      { pageId },
    );
    console.log(`  - ${pageId}: ${JSON.stringify(got)}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
