/**
 * Seeds the 16 real `testimonial` documents from data/testimonials.ts, plus the
 * band headers on the three pages that show testimonials.
 *
 *   npx sanity exec scripts/seed-testimonials.ts --with-user-token
 *
 * The homepage previously showed 3 DIFFERENT quotes, all attributed to "Former
 * Client" with a practice-area tag, with zero overlap with these 16 — they read
 * as design-phase placeholder copy. The firm chose to feature real testimonials
 * instead, so those three are not migrated (F19).
 *
 * `featured` is seeded on the three shortest quotes, because the homepage card
 * was built for ~250 characters and the real ones run to 1018. That's only a
 * starting point — the firm picks via the toggle in the Studio.
 *
 * Source: scripts/data/testimonials.seed.json — frozen from data/testimonials.ts
 * before that file was deleted.
 *
 * Ranks use `lexorank`, matching @sanity/orderable-document-list (D2), so the
 * wall keeps the order the quotes were curated in.
 *
 * Matched on author+quote, so re-running updates rather than duplicating.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import seed from "./data/testimonials.seed.json";

const client = getCliClient();


const MAX_FEATURED = 3;

const BANDS: Array<{ id: string; type: string; field: string; value: object }> = [
  {
    id: "homePage",
    type: "homePage",
    field: "testimonials",
    value: {
      _type: "testimonialsBand",
      eyebrow: "Client Testimonials",
      headingLead: "What Clients Are",
      headingStrong: "Saying About Us.",
    },
  },
  {
    id: "attorneysPage",
    type: "attorneysPage",
    field: "testimonials",
    value: {
      _type: "testimonialsBand",
      eyebrow: "Client Testimonials",
      headingLead: "What Clients Are",
      headingStrong: "Saying About Us.",
    },
  },
];

async function main() {
  const source = seed as Array<{ quote: string; author: string }>;
  console.log(`Seeding ${source.length} testimonials into "${client.config().dataset}"…`);

  // Feature the three shortest — closest to what the card was designed for.
  const featured = new Set(
    [...source]
      .sort((a, b) => a.quote.length - b.quote.length)
      .slice(0, MAX_FEATURED)
      .map((t) => t.quote),
  );

  let rank = LexoRank.middle();
  for (const t of source) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "testimonial" && author == $author && quote == $quote][0]{_id}`,
      { author: t.author, quote: t.quote },
    );

    const doc = {
      _type: "testimonial",
      quote: t.quote,
      author: t.author,
      featured: featured.has(t.quote),
      orderRank: rank.toString(),
    };

    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
    } else {
      await client.create(doc);
    }
    console.log(
      `  ${featured.has(t.quote) ? "★" : " "} ${String(t.quote.length).padStart(4)}ch  ${t.author}`,
    );
    rank = rank.genNext();
  }

  console.log("Band headers:");
  const tx = client.transaction();
  for (const b of BANDS) {
    tx.createIfNotExists({ _id: b.id, _type: b.type });
    tx.patch(b.id, (p) => p.setIfMissing({ [b.field]: b.value }));
  }
  await tx.commit();
  for (const b of BANDS) console.log(`  - ${b.id}.${b.field}`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
