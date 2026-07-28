import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const PATHS_QUERY = defineQuery(`*[_type == "locationPage"] | order(orderRank){
  _id,
  title,
  navLabel,
  heroTitle,
  heroImage,
  lede,
  body,
  faqs[]{ _key, question, answer },
  "slug": slug.current,
  "cityName": city->city,
  "citySlug": city->citySlug.current,
  _updatedAt,
  seo{
    metaTitle,
    metaDescription,
    canonicalUrl,
    noIndex,
    ogImage
  }
}`);

/**
 * Built once per production build and reused; refetched every call in dev.
 *
 * Astro caches `getStaticPaths()` per route module for the dev server's whole
 * lifetime (core/render/route-cache.js — it only re-runs when the route FILE
 * changes), so a page whose data arrives via getStaticPaths props goes stale the
 * moment someone edits content in the Studio, and only a restart clears it.
 * The page therefore looks its own record up through `getLocationPage()` at
 * render time instead of trusting props, and this cache keeps that free: in a
 * production build every page shares the single fetch getStaticPaths already
 * made. Same arrangement as src/sanity/lib/practiceAreas.ts.
 */
let pagesCache: ReturnType<typeof fetchPages> | null = null;

function getPages() {
  if (import.meta.env.PROD) {
    pagesCache ??= fetchPages();
    return pagesCache;
  }
  return fetchPages();
}

async function fetchPages() {
  return (await sanityClient.fetch(PATHS_QUERY)) ?? [];
}

type LocationDoc = Awaited<ReturnType<typeof fetchPages>>[number];

/** The breadcrumb trail for a location page. City is a grouping label — no href. */
const trailFor = (p: LocationDoc) => [
  { title: "Areas We Serve" },
  { title: p.cityName! },
  { title: p.navLabel!, href: `/${p.citySlug}/${p.slug}` },
];

/** { params:{city,slug}, props } for every location page — getStaticPaths. */
export async function getAreaPaths() {
  const pages = await getPages();
  return pages.map((p) => ({
    params: { city: p.citySlug!, slug: p.slug! },
    props: { page: p, cityName: p.cityName, trail: trailFor(p) },
  }));
}

/**
 * One location page by its city + slug, ready to render. The page calls this
 * with `Astro.params` rather than reading props, so Studio edits show up on the
 * next dev refresh instead of the next restart.
 */
export async function getLocationPage(city: string, slug: string) {
  const pages = await getPages();
  const page = pages.find((p) => p.citySlug === city && p.slug === slug);
  if (!page) return null;
  return { page, cityName: page.cityName, trail: trailFor(page) };
}
