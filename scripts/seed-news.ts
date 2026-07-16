/**
 * Seeds the 12 `newsItem` documents plus the homepage News band.
 *
 *   npx sanity exec scripts/seed-news.ts --with-user-token
 *
 * Source: scripts/data/news.seed.json — frozen from data/news.ts.
 *
 * All 12 are external press mentions today (no owned articles), so `linkType` is
 * "external" and there's no `body`. `outletLogo` was in the old type but never
 * used, so nothing to migrate there.
 *
 * `publishedAt` is seeded DESCENDING in the file's curation order — item 0 gets
 * today, item 1 yesterday, etc. — so "newest first" reproduces the order the site
 * showed. The firm edits real dates in the Studio (they override the auto date).
 *
 * The homepage features the item that's featured today (KHOU / Len Cannon), so
 * the left card + the 3-newest right column match the current page exactly (F20).
 *
 * Matched on slug, so re-running updates rather than duplicating.
 */
import { getCliClient } from "sanity/cli";
import seed from "./data/news.seed.json";

const client = getCliClient();

interface SeedNews {
  slug: string;
  outlet: string;
  title: string;
  media: "article" | "video" | "podcast";
  summary: string;
  externalUrl?: string;
  ctaLabel?: string;
  featured?: boolean;
}

const items = seed as SeedNews[];

const DAY = 24 * 60 * 60 * 1000;

const compact = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

async function main() {
  console.log(`Seeding ${items.length} news items into "${client.config().dataset}"…`);

  const now = Date.now();
  const idBySlug = new Map<string, string>();

  for (let i = 0; i < items.length; i++) {
    const n = items[i];
    // Descending: item 0 = today, item 1 = yesterday, …  preserves curation order.
    const publishedAt = new Date(now - i * DAY).toISOString();

    const doc = compact({
      _type: "newsItem",
      title: n.title,
      slug: { _type: "slug", current: n.slug },
      outlet: n.outlet,
      media: n.media,
      summary: n.summary,
      publishedAt,
      linkType: "external",
      externalUrl: n.externalUrl,
      ctaLabel: n.ctaLabel,
    });

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "newsItem" && slug.current == $slug][0]{_id}`,
      { slug: n.slug },
    );
    let id: string;
    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
      id = existing._id;
    } else {
      id = (await client.create(doc))._id;
    }
    idBySlug.set(n.slug, id);
    console.log(`  ${n.featured ? "★" : " "} ${n.outlet} — ${n.title.slice(0, 46)}`);
  }

  // Feature the item featured today, so the homepage is unchanged.
  const featured = items.find((n) => n.featured) ?? items[0];
  const featuredId = idBySlug.get(featured.slug)!;

  const BAND = {
    _type: "newsBand",
    eyebrow: "Press & Media",
    headingLead: "In the",
    headingStrong: "News.",
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
            text: "Our attorneys are known throughout Texas and nationally for handling high-profile, high-stakes cases — work that has drawn coverage from local, national, and global media. A selection of recent articles, interviews, and appearances.",
          },
        ],
      },
    ],
    featured: { _type: "reference", _ref: featuredId },
  };

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });
  await client.patch("homePage").setIfMissing({ news: BAND }).commit();
  console.log(`  homePage.news band — featured: ${featured.outlet}`);

  // /news page grid header (F16 — page copy on the newsPage singleton).
  await client.createIfNotExists({ _id: "newsPage", _type: "newsPage" });
  await client
    .patch("newsPage")
    .setIfMissing({
      grid: { eyebrow: "Press & Media", headingLead: "In the", headingStrong: "Headlines." },
    })
    .commit();
  console.log("  newsPage.grid header");

  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
