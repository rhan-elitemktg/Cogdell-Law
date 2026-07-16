/**
 * Seeds the Home Page statement band with the copy that was hardcoded in
 * StatementBand.astro (formerly VideoBand.astro — there was never a video).
 *
 *   npx sanity exec scripts/seed-statement-band.ts --with-user-token
 *
 * The team photo stays in the repo (D6): it's art-directed and full-bleed, so it
 * keeps its astro:assets pipeline.
 *
 * setIfMissing per field, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const block = (text: string) => [
  {
    _type: "block",
    _key: "p1",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "p1s", text, marks: [] }],
  },
];

const STATEMENT = {
  eyebrow: "A Litigation Boutique",
  headingItalic: "Built for the Highest Stakes —",
  headingBold: "Civil and Criminal.",
  body: block(
    "We are trial lawyers. We handle complex civil disputes alongside white collar defense and serious criminal matters — because the same preparation and courtroom ability that wins in federal criminal court wins in complex civil litigation.",
  ),
  cta: { _type: "ctaButton", label: "About the Firm", href: "/our-firm" },
};

async function main() {
  console.log(`Seeding statement band into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });

  const patch = client.patch("homePage");
  for (const [key, value] of Object.entries(STATEMENT)) {
    patch.setIfMissing({ [`statement.${key}`]: value });
  }
  await patch.commit();

  const written = await client.fetch<Record<string, unknown>>(
    `*[_id == "homePage"][0].statement{eyebrow, headingItalic, headingBold, "bodyBlocks": count(body), "cta": cta.label}`,
  );
  console.log(JSON.stringify(written, null, 2).replace(/^/gm, "  "));
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
