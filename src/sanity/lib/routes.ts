// Every URL this site builds, assembled once from the same helpers the routes
// themselves use.
//
// Two consumers, and they want different slices of it:
//
//   sitemap.xml.ts         — the indexable subset (drops `noIndex` pages)
//   bulk-redirects.json.ts — the FULL set, as a collision guard. Vercel evaluates
//                            bulk redirects before the filesystem, so a redirect
//                            whose source is a live path would black-hole a
//                            working page. A `noIndex` page is still a live page,
//                            which is why the filtering is left to the caller.
//
// The hardcoded half of the list lives in lib/routePaths.ts — check it when
// adding a page, since it's the one part that isn't derived from a route.
import { DOCUMENT_BACKED, CODE_ONLY_PATHS, STATIC_PATHS, normalizePath } from "../../lib/routePaths";
import { getStaticPageSeo } from "./seo";
import { getPracticeAreaPaths } from "./practiceAreas";
import { getAreaPaths } from "./areasWeServe";
import { getAttorneySlugs } from "./attorneys";
import { getOwnedNewsSlugs } from "./news";
import { getPodcastSlugs } from "./podcast";

export interface SiteEntry {
  path: string;
  lastmod?: string;
  noIndex?: boolean | null;
}

/**
 * Built once per production build and reused, matching `buildTree()` in
 * practiceAreas.ts — sitemap.xml and bulk-redirects.json both call this, and
 * there's no reason for the second one to refetch. Dev refetches so Studio edits
 * show up on refresh.
 */
let entriesCache: Promise<SiteEntry[]> | null = null;

/** Every route the site builds, `noIndex` flags included but not applied. */
export function getSiteEntries(): Promise<SiteEntry[]> {
  if (import.meta.env.PROD) {
    entriesCache ??= fetchSiteEntries();
    return entriesCache;
  }
  return fetchSiteEntries();
}

async function fetchSiteEntries(): Promise<SiteEntry[]> {
  const [pageSeo, practiceAreas, locations, attorneys, ownedNews, podcasts] = await Promise.all([
    getStaticPageSeo(Object.keys(DOCUMENT_BACKED)),
    getPracticeAreaPaths(),
    getAreaPaths(),
    getAttorneySlugs(),
    getOwnedNewsSlugs(),
    getPodcastSlugs(),
  ]);

  const entries: SiteEntry[] = [
    ...pageSeo.map((page) => ({
      path: DOCUMENT_BACKED[page._id],
      lastmod: page._updatedAt,
      noIndex: page.noIndex,
    })),
    ...CODE_ONLY_PATHS.map((path) => ({ path })),
    ...practiceAreas.map(({ params, props }) => ({
      path: `/practice-areas/${params.slug}`,
      lastmod: props.node._updatedAt,
      noIndex: props.node.seo?.noIndex,
    })),
    ...locations.map(({ params, props }) => ({
      path: `/${params.city}/${params.slug}`,
      lastmod: props.page._updatedAt,
      noIndex: props.page.seo?.noIndex,
    })),
    ...(attorneys ?? []).map((attorney) => ({
      path: `/attorney/${attorney.slug}`,
      lastmod: attorney._updatedAt,
      noIndex: attorney.noIndex,
    })),
    ...(ownedNews ?? []).map((item) => ({
      path: `/news/${item.slug}`,
      lastmod: item._updatedAt,
      noIndex: item.noIndex,
    })),
    ...podcasts.map((item) => ({
      path: `/podcast/${item.slug}`,
      lastmod: item._updatedAt,
      noIndex: item.noIndex,
    })),
  ];

  return entries.filter((entry) => Boolean(entry.path));
}

/**
 * Every live path plus the reserved ones, normalized and ready to test a redirect
 * source against.
 */
export async function getLivePaths(): Promise<Set<string>> {
  const entries = await getSiteEntries();
  return new Set([...entries.map((entry) => entry.path), ...STATIC_PATHS].map(normalizePath));
}
