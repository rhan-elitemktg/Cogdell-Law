/**
 * Creates a "Demo" practice area showing every page-body block (D16) in one
 * page — CTA banner, Get In Touch bar, attorney card, attorney quote and client
 * testimonial, interleaved with ordinary prose so the spacing between them is
 * visible.
 *
 *   npx sanity exec scripts/seed-demo-practice-area.ts --with-user-token
 *
 * IT IS A REAL, ROUTED, PUBLISHED PAGE at /practice-areas/demo. Two things
 * follow, and neither is avoidable in content alone:
 *
 *  - It appears in the Practice Areas menu and in the sidebar rail of every
 *    practice area page. `PRACTICE_AREAS_NAV_QUERY` has no filter — every
 *    practiceArea document is in the nav.
 *  - Creating it fires the publish→deploy webhook, so it goes live on the next
 *    build like any other page.
 *
 * `seo.noIndex` is set, which keeps it out of sitemap.xml and asks search
 * engines to skip it — but that does nothing about the menu. Delete the document
 * when you're done with it:
 *
 *   npx sanity documents delete demoPracticeArea --dataset production
 *
 * Fixed `_id` so it's easy to find and delete, and createIfNotExists +
 * setIfMissing so re-running never clobbers edits you make in the Studio.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

// Real documents in this dataset — the reference blocks render nothing useful
// without them. Re-check with:
//   *[_type=="attorney"][0]._id  /  *[_type=="testimonial"][0]._id
const ATTORNEY_ID = "Hg9HaH4nAtEIMjWZ2cgRWm"; // Dan L. Cogdell
const TESTIMONIAL_ID = "MvFbhBXZNcItUZk0GAsywx"; // P.W.

/** A plain body paragraph. */
const p = (key: string, text: string) => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}s`, marks: [], text }],
});

/** A body heading. */
const h = (key: string, style: "h2" | "h3", text: string) => ({
  _type: "block",
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: `${key}s`, marks: [], text }],
});

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non ipsum purus. Maecenas nec luctus ante. Morbi leo ipsum, dignissim at sagittis commodo, tincidunt dapibus magna. Cras enim velit, dictum ut pretium ut, rhoncus a arcu.";

const BODY = [
  p("intro", `Every block below is a real page-body block. ${LOREM}`),

  h("h2a", "h2", "CTA Banner"),
  p("p1", "Heading only — the tighter variant, with the house buttons."),
  {
    _type: "bodyCta",
    _key: "cta1",
    heading: "Contact a Criminal Defense Lawyer in Houston",
  },
  p("p2", "And the same block with a supporting line and an overridden button."),
  {
    _type: "bodyCta",
    _key: "cta2",
    heading: "Contact a Criminal Defense Lawyer in Houston",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vestibulum purus est nec mattis scelerisque.",
    primaryCta: { _type: "ctaButton", label: "Request a Case Review", href: "/contact" },
  },

  h("h2b", "h2", "Get In Touch Bar"),
  p("p3", "Quieter than the banner — no buttons, just the number."),
  { _type: "bodyPhoneBar", _key: "bar1", heading: "Get In Touch With Us" },

  h("h2c", "h2", "Attorney Card"),
  p("p4", "Third person — an introduction to the attorney on this subject."),
  {
    _type: "bodyAttorney",
    _key: "atty1",
    attorney: { _type: "reference", _ref: ATTORNEY_ID },
    body: LOREM,
  },

  h("h2d", "h2", "Attorney Quote"),
  p("p5", "The same person, in their own voice."),
  {
    _type: "bodyQuoteCta",
    _key: "quote1",
    attorney: { _type: "reference", _ref: ATTORNEY_ID },
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non ipsum purus. Maecenas nec luctus ante. Morbi leo ipsum, dignissim at sagittis commodo.",
  },

  h("h2e", "h2", "Client Testimonial"),
  p("p6", "A paper card rather than a navy interruption — evidence, not a pitch."),
  { _type: "bodyTestimonial", _key: "test1", testimonial: { _type: "reference", _ref: TESTIMONIAL_ID } },

  h("h2f", "h2", "Ordinary Prose"),
  p("p7", LOREM),
  h("h3a", "h3", "A Heading 3, For Spacing"),
  p("p8", LOREM),
  {
    _type: "block",
    _key: "bq",
    style: "blockquote",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "bqs",
        marks: [],
        text: "A blockquote, so the ornament and card treatment can be compared with the testimonial above.",
      },
    ],
  },
  p("p9", LOREM),
];

const DOC = {
  _id: "demoPracticeArea",
  _type: "practiceArea",
  title: "Demo",
  slug: { _type: "slug", current: "demo" },
  heroTitle: "Every Page-Body Block",
  cardSummary:
    "An internal demo page showing every page-body block in one place. Not for public linking.",
  // Sorts last in the Studio's orderable list and in the nav. Existing ranks run
  // "0|100008:" … "0|10008o:".
  orderRank: "0|zzzzzz:",
  body: BODY,
  factCheck: { show: true },
  // Keeps it out of sitemap.xml and asks crawlers to skip it. Does NOT hide it
  // from the Practice Areas menu — see the header note.
  seo: { _type: "seo", noIndex: true },
};

async function main() {
  console.log(`Seeding the Demo practice area into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: DOC._id, _type: DOC._type });
  const { _id, _type, ...fields } = DOC;
  await client.patch(_id).setIfMissing(fields).commit();

  const written = await client.fetch<Record<string, unknown>>(
    `*[_id == "demoPracticeArea"][0]{
      title,
      "slug": slug.current,
      "bodyItems": count(body),
      "blocks": array::unique(body[_type != "block"]._type),
      "noIndex": seo.noIndex
    }`,
  );
  console.log(JSON.stringify(written, null, 2).replace(/^/gm, "  "));
  console.log("\n  → /practice-areas/demo");
  console.log("  Delete with: npx sanity documents delete demoPracticeArea --dataset production");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
