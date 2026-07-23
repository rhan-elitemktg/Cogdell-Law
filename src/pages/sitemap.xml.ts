// sitemap.xml, generated from the same helpers that build the routes (D15).
//
// Hand-rolled rather than @astrojs/sitemap because that integration's `filter`
// is synchronous and can't see the per-page `noIndex` toggle — flagged pages
// would still be submitted to Google, making the toggle a half-feature. The
// helpers below already return every route the site builds, plus each record's
// `_updatedAt` and SEO block, so honouring the flag here costs nothing.
//
// Anything added to this list must also exist as a route, and vice versa — the
// static list is the one place that isn't derived, so check it when adding a page.
import type { APIRoute } from "astro";
import { canonicalize } from "../lib/seo";
import { getStaticPageSeo } from "../sanity/lib/seo";
import { getPracticeAreaPaths } from "../sanity/lib/practiceAreas";
import { getAreaPaths } from "../sanity/lib/areasWeServe";
import { getAttorneySlugs } from "../sanity/lib/attorneys";
import { getOwnedNewsSlugs } from "../sanity/lib/news";

interface Entry {
  path: string;
  lastmod?: string;
  noIndex?: boolean | null;
}

/** Static routes backed by a Sanity document, keyed by that document's `_id`. */
const DOCUMENT_BACKED: Record<string, string> = {
  homePage: "/",
  ourFirmPage: "/our-firm",
  attorneysPage: "/attorneys",
  practiceAreasPage: "/practice-areas",
  trialExperiencePage: "/trial-experience",
  testimonialsPage: "/testimonials",
  videosPage: "/videos",
  newsPage: "/news",
  contactPage: "/contact",
  privacy: "/privacy",
  disclaimer: "/disclaimer",
};

// Routes with no document of their own. /404 is deliberately absent — an error
// page has no business in a sitemap — and so is /admin (the Studio).
const CODE_ONLY: Entry[] = [{ path: "/site-map" }];

const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const origin = canonicalize(site?.href ?? "https://www.cogdell-law.com");

  const [pageSeo, practiceAreas, locations, attorneys, ownedNews] = await Promise.all([
    getStaticPageSeo(Object.keys(DOCUMENT_BACKED)),
    getPracticeAreaPaths(),
    getAreaPaths(),
    getAttorneySlugs(),
    getOwnedNewsSlugs(),
  ]);

  const entries: Entry[] = [
    ...pageSeo.map((page) => ({
      path: DOCUMENT_BACKED[page._id],
      lastmod: page._updatedAt,
      noIndex: page.noIndex,
    })),
    ...CODE_ONLY,
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
    ...attorneys.map((attorney) => ({
      path: `/attorney/${attorney.slug}`,
      lastmod: attorney._updatedAt,
      noIndex: attorney.noIndex,
    })),
    ...ownedNews.map((item) => ({
      path: `/news/${item.slug}`,
      lastmod: item._updatedAt,
      noIndex: item.noIndex,
    })),
  ];

  const urls = entries
    .filter((entry) => entry.path && entry.noIndex !== true)
    .map((entry) => {
      const loc = xmlEscape(canonicalize(`${origin}${entry.path}`) || origin);
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
