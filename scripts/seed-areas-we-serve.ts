/**
 * Seeds the "Areas We Serve" cities + location pages from data/areas-we-serve.ts.
 *
 *   npx sanity exec scripts/seed-areas-we-serve.ts --with-user-token
 *
 * Cities created first (grouping labels), then their pages referencing them.
 * intro/sections/faqs → blockContent via the shared converter. Matched on slug,
 * so re-running updates. Order preserved via lexorank (D2).
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import { areasWeServe } from "../src/data/areas-we-serve";
import { blocksToPT } from "./lib/blockToPortableText";
import type { Block, Section } from "./lib/blockToPortableText";

const client = getCliClient();

async function main() {
  console.log(`Seeding areas we serve into "${client.config().dataset}"…`);

  let cityRank = LexoRank.middle();
  for (const city of areasWeServe as any[]) {
    const existingCity = await client.fetch<{ _id: string } | null>(
      `*[_type == "serviceCity" && citySlug.current == $slug][0]{_id}`,
      { slug: city.citySlug },
    );
    const cityDoc = {
      _type: "serviceCity",
      city: city.city,
      citySlug: { _type: "slug", current: city.citySlug },
      orderRank: cityRank.toString(),
    };
    const cityId = existingCity?._id
      ? (await client.patch(existingCity._id).set(cityDoc).commit())._id
      : (await client.create(cityDoc))._id;
    console.log(`• ${city.city}`);
    cityRank = cityRank.genNext();

    let pageRank = LexoRank.middle();
    for (const page of city.pages) {
      const kb = page.slug.replace(/[^a-z0-9]/gi, "").slice(0, 40);
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_type == "locationPage" && slug.current == $slug][0]{_id}`,
        { slug: page.slug },
      );
      const doc: Record<string, unknown> = {
        _type: "locationPage",
        city: { _type: "reference", _ref: cityId },
        title: page.title,
        navLabel: page.navLabel,
        slug: { _type: "slug", current: page.slug },
        heroTitle: page.heroTitle,
        orderRank: pageRank.toString(),
      };
      if (page.lede) doc.lede = page.lede;
      if (page.intro?.length) doc.intro = blocksToPT(page.intro as Block[], `${kb}-intro`);
      if (page.sections?.length)
        doc.sections = (page.sections as Section[]).map((sec, i) => ({
          _key: `${kb}-s${i}`, _type: "section", heading: sec.heading, body: blocksToPT(sec.blocks, `${kb}-s${i}`),
        }));
      if (page.faqs?.length)
        doc.faqs = page.faqs.map((f: any, i: number) => ({
          _key: `${kb}-f${i}`, _type: "practiceFaq", question: f.question, answer: blocksToPT(f.answer, `${kb}-f${i}`),
        }));

      if (existing?._id) await client.patch(existing._id).set(doc).commit();
      else await client.create(doc);
      console.log(`    ↳ ${page.slug}`);
      pageRank = pageRank.genNext();
    }
  }
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
