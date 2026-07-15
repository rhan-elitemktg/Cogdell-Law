/**
 * Seeds the site-wide CTA Bar with the copy that was hardcoded in CtaBar.astro.
 *
 *   npx sanity exec scripts/seed-cta-bar.ts --with-user-token
 *
 * One shared record — the band renders identically on ~43 pages, and most of
 * those are dynamic routes with no page document to hold a copy (D13). Pages
 * that want their own wording set their optional `ctaBar` override; none do yet.
 *
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const CONTENT = {
  _type: "ctaBarContent",
  eyebrow: "When the Stakes Are Highest",
  headingLead: "Call",
  headingRest: "Cogdell Law Firm.",
  body: [
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
          text: "Our attorneys have tried the most difficult cases in federal and state courts across the country. If you are facing a serious charge or a high-stakes dispute, call us before you say anything to anyone else.",
        },
      ],
    },
  ],
  cta: { _type: "ctaButton", label: "Schedule Consultation", href: "/contact" },
};

async function main() {
  console.log(`Seeding CTA Bar into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: "ctaBar", _type: "ctaBar" });
  await client.patch("ctaBar").setIfMissing({ content: CONTENT }).commit();

  const written = await client.fetch<Record<string, unknown>>(
    `*[_id == "ctaBar"][0].content{eyebrow, headingLead, headingRest, "bodyBlocks": count(body), "cta": cta.label}`,
  );
  console.log(JSON.stringify(written, null, 2).replace(/^/gm, "  "));
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
