/**
 * Seeds the practice-area tree (~20 nodes) from data/practice-areas.ts.
 *
 *   npx sanity exec scripts/seed-practice-areas-tree.ts --with-user-token
 *
 * Flat documents with self-referencing `parent` (D1). Parents are created before
 * children so their ids resolve. intro/sections/faqs → blockContent via the
 * shared converter. Icons map raw SVG paths back to their key.
 *
 * Matched on slug + parent, so re-running updates rather than duplicating.
 * Sibling order preserved via lexorank (D2).
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import { practiceAreas } from "../src/data/practice-areas";
import { PRACTICE_AREA_ICONS } from "../src/lib/practiceAreaIcons";
import { toBlockContent } from "./lib/blockToPortableText";
import type { Block, Section } from "./lib/blockToPortableText";

const client = getCliClient();

// raw SVG path → icon key
const PATH_TO_KEY = new Map(Object.entries(PRACTICE_AREA_ICONS).map(([k, v]) => [v, k]));

interface Area {
  slug: string;
  title: string;
  heroTitle: string;
  lede?: string;
  cardSummary?: string;
  icon?: string;
  intro?: Block[];
  sections?: Section[];
  faqs?: { question: string; answer: Block[] }[];
  children?: Area[];
}

async function upsert(area: Area, parentId: string | null, rank: string, keyBase: string): Promise<string> {
  const existing = await client.fetch<{ _id: string } | null>(
    parentId
      ? `*[_type == "practiceArea" && slug.current == $slug && parent._ref == $parentId][0]{_id}`
      : `*[_type == "practiceArea" && slug.current == $slug && !defined(parent)][0]{_id}`,
    { slug: area.slug, parentId },
  );

  const doc: Record<string, unknown> = {
    _type: "practiceArea",
    title: area.title,
    slug: { _type: "slug", current: area.slug },
    heroTitle: area.heroTitle,
    orderRank: rank,
  };
  if (area.lede) doc.lede = area.lede;
  if (area.cardSummary) doc.cardSummary = area.cardSummary;
  if (area.icon) doc.icon = PATH_TO_KEY.get(area.icon);
  if (parentId) doc.parent = { _type: "reference", _ref: parentId };
  const body = toBlockContent({ intro: area.intro, sections: area.sections }, keyBase);
  if (body.length) doc.body = body;
  if (area.faqs?.length)
    doc.faqs = area.faqs.map((f, i) => ({
      _key: `${keyBase}-f${i}`,
      _type: "practiceFaq",
      question: f.question,
      answer: toBlockContent({ intro: f.answer }, `${keyBase}-f${i}`),
    }));

  if (existing?._id) {
    await client.patch(existing._id).set(doc).commit();
    return existing._id;
  }
  return (await client.create(doc))._id;
}

async function walk(areas: Area[], parentId: string | null, prefix: string) {
  let rank = LexoRank.middle();
  for (const area of areas) {
    const keyBase = `${prefix}${area.slug}`.replace(/[^a-z0-9]/gi, "").slice(0, 40);
    const id = await upsert(area, parentId, rank.toString(), keyBase);
    console.log(`  ${parentId ? "  ↳" : "•"} ${area.slug}`);
    if (area.children?.length) await walk(area.children, id, `${prefix}${area.slug}-`);
    rank = rank.genNext();
  }
}

async function main() {
  console.log(`Seeding practice-area tree into "${client.config().dataset}"…`);
  await walk(practiceAreas as Area[], null, "");
  const total = await client.fetch<number>(`count(*[_type == "practiceArea"])`);
  console.log(`Done — ${total} practice areas.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
