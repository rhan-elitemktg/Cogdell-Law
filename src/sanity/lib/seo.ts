import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * Per-page search metadata (D15).
 *
 * Page singletons fetch it here, one page at a time, exactly like
 * `getPageHero()`. The five routed document types instead carry the same
 * `seo{…}` projection inline in their own document query — TypeGen parses
 * `defineQuery()` statically, so the projection can't be shared as a constant
 * and is spelled out in each. Change one, change them all; grep `metaTitle`.
 */
const PAGE_SEO_QUERY = defineQuery(`*[_id == $pageId][0].seo{
  metaTitle,
  metaDescription,
  canonicalUrl,
  noIndex,
  ogImage
}`);

/**
 * The SEO block for an interior page singleton, mirroring `getPageHero()`.
 * Returns null when the page has no SEO set — every consumer falls back (D15).
 */
export async function getSeo(pageId: string) {
  return await sanityClient.fetch(PAGE_SEO_QUERY, { pageId });
}

// Just what sitemap.xml needs from the page singletons — one round trip for all
// of them rather than one per page.
const STATIC_PAGE_SEO_QUERY = defineQuery(`*[_id in $ids]{
  _id,
  _updatedAt,
  "noIndex": seo.noIndex
}`);

/** `_updatedAt` + the noIndex flag for the given page singletons (sitemap.xml). */
export async function getStaticPageSeo(ids: string[]) {
  return (await sanityClient.fetch(STATIC_PAGE_SEO_QUERY, { ids })) ?? [];
}
