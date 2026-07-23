import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

// Shared projection: everything a card needs, plus the resolved link.
// `date` is coalesce(publishedAt, _createdAt) — the effective "newest" date.
const CARD = `{
  _id,
  title,
  outlet,
  media,
  summary,
  ctaLabel,
  linkType,
  externalUrl,
  "slug": slug.current,
  "date": coalesce(publishedAt, _createdAt),
  outletLogo
}`;

const ALL_NEWS_QUERY = defineQuery(
  `*[_type == "newsItem"] | order(coalesce(publishedAt, _createdAt) desc)${CARD}`,
);

/** Every news item, newest first — for the /news page. */
export async function getAllNews() {
  return (await sanityClient.fetch(ALL_NEWS_QUERY)) ?? [];
}

// The homepage band: header + the featured item, plus the 3 newest EXCLUDING it.
const NEWS_BAND_QUERY = defineQuery(`*[_id == "homePage"][0].news{
  eyebrow,
  headingLead,
  headingStrong,
  lede,
  "featured": featured->${CARD},
  "featuredId": featured._ref
}`);

/**
 * Homepage News band. Returns the featured item and the 3 newest others.
 * The exclusion runs in JS so the whole thing is one round-trip.
 */
export async function getHomeNews() {
  const band = await sanityClient.fetch(NEWS_BAND_QUERY);
  if (!band) return null;
  const rest = (await getAllNews())
    .filter((n) => n._id !== band.featuredId)
    .slice(0, 3);
  return { ...band, rest };
}

const NEWS_ITEM_QUERY = defineQuery(`*[_type == "newsItem" && slug.current == $slug][0]{
  _id,
  title,
  outlet,
  summary,
  body,
  "slug": slug.current,
  _updatedAt,
  seo{
    metaTitle,
    metaDescription,
    canonicalUrl,
    noIndex,
    ogImage
  }
}`);

/** One owned article, for /news/[slug]. */
export async function getNewsItem(slug: string) {
  return await sanityClient.fetch(NEWS_ITEM_QUERY, { slug });
}

// `_updatedAt` and the noIndex flag ride along for sitemap.xml (D15).
const OWNED_NEWS_SLUGS_QUERY = defineQuery(
  `*[_type == "newsItem" && linkType == "article" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noIndex": seo.noIndex}`,
);

/** Slugs of owned articles only — external mentions have no detail page. */
export async function getOwnedNewsSlugs() {
  return await sanityClient.fetch(OWNED_NEWS_SLUGS_QUERY);
}

const NEWS_GRID_HEADER_QUERY = defineQuery(`*[_id == "newsPage"][0].grid{
  eyebrow,
  headingLead,
  headingStrong
}`);

/** The /news page grid header (F16 — page copy). */
export async function getNewsGridHeader() {
  return await sanityClient.fetch(NEWS_GRID_HEADER_QUERY);
}
