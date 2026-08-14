import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

// Shared projection: everything a podcast card needs. `date` is
// coalesce(publishedAt, _createdAt) — the effective "newest" date.
const CARD = `{
  _id,
  title,
  "slug": slug.current,
  "date": coalesce(publishedAt, _createdAt),
  coverImage
}`;

const ALL_PODCASTS_QUERY = defineQuery(
  `*[_type == "podcast"] | order(coalesce(publishedAt, _createdAt) desc)${CARD}`,
);

/**
 * Every episode, newest first — for the /podcast index grid.
 *
 * Memoized in PROD, and that is load-bearing rather than a nicety: getPodcast()
 * calls this to derive related episodes, so at 82 episode pages an unmemoized
 * version is ~164 round-trips with `useCdn: false` where there were 4. Same
 * pattern as getSiteEntries() and getFirmDetails(). DEV stays uncached so an
 * edit shows up on the next request.
 */
let allCache: Promise<PodcastCard[]> | null = null;
type PodcastCard = Awaited<ReturnType<typeof fetchAllPodcasts>>[number];

async function fetchAllPodcasts() {
  return (await sanityClient.fetch(ALL_PODCASTS_QUERY)) ?? [];
}

export async function getAllPodcasts() {
  if (!import.meta.env.PROD) return fetchAllPodcasts();
  allCache ??= fetchAllPodcasts();
  return allCache;
}

// The full episode, for /podcast/[slug]. The `seo{…}` projection is spelled out
// inline (not shared) — TypeGen parses defineQuery statically. See seo.ts.
const PODCAST_QUERY = defineQuery(`*[_type == "podcast" && slug.current == $slug][0]{
  _id,
  title,
  youtubeId,
  summary,
  "slug": slug.current,
  "date": coalesce(publishedAt, _createdAt),
  coverImage,
  body,
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
 * One episode, for /podcast/[slug], plus the 3 newest others as "related".
 *
 * There is no curated override — an earlier version read `episode.related`, a
 * field that has never existed on the schema and was never projected. It only
 * compiled because `npm run build` is a bare `astro build` with no `astro check`.
 */
export async function getPodcast(slug: string) {
  const episode = await sanityClient.fetch(PODCAST_QUERY, { slug });
  if (!episode) return null;

  const related = (await getAllPodcasts()).filter((p) => p.slug !== slug).slice(0, 3);

  return { ...episode, related };
}

// `_updatedAt` and the noIndex flag ride along for sitemap.xml (D15).
const PODCAST_SLUGS_QUERY = defineQuery(
  `*[_type == "podcast" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noIndex": seo.noIndex}`,
);

/** Slugs of every episode — for getStaticPaths and sitemap.xml. */
export async function getPodcastSlugs() {
  return (await sanityClient.fetch(PODCAST_SLUGS_QUERY)) ?? [];
}

const PODCAST_HERO_QUERY = defineQuery(`*[_id == "podcastPage"][0].hero{
  eyebrow,
  title,
  subtitle
}`);

/** The /podcast index hero copy (F16 — page copy on the podcastPage singleton). */
export async function getPodcastHero() {
  return await sanityClient.fetch(PODCAST_HERO_QUERY);
}
