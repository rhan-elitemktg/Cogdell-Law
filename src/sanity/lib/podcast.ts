import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

// Shared projection: everything a podcast card needs. `date` is
// coalesce(publishedAt, _createdAt) — the effective "newest" date.
const CARD = `{
  _id,
  title,
  episodeNumber,
  tag,
  "slug": slug.current,
  "date": coalesce(publishedAt, _createdAt),
  coverImage
}`;

const ALL_PODCASTS_QUERY = defineQuery(
  `*[_type == "podcast"] | order(coalesce(publishedAt, _createdAt) desc)${CARD}`,
);

/** Every episode, newest first — for the /podcast index grid. */
export async function getAllPodcasts() {
  return (await sanityClient.fetch(ALL_PODCASTS_QUERY)) ?? [];
}

// The full episode, for /podcast/[slug]. `related` is the curated override; the
// helper below tops it up to 3 when it's short. The `seo{…}` projection is spelled
// out inline (not shared) — TypeGen parses defineQuery statically. See seo.ts.
const PODCAST_QUERY = defineQuery(`*[_type == "podcast" && slug.current == $slug][0]{
  _id,
  title,
  episodeNumber,
  tag,
  summary,
  "slug": slug.current,
  "date": coalesce(publishedAt, _createdAt),
  coverImage,
  body,
  spotifyUrl,
  chapters,
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
 * One episode, for /podcast/[slug]. Related episodes: the editor's curated list,
 * topped up to 3 with the newest OTHER episodes (same tag first) when short — the
 * same "derive the rest in JS" pattern as the homepage News band (getHomeNews).
 */
export async function getPodcast(slug: string) {
  const episode = await sanityClient.fetch(PODCAST_QUERY, { slug });
  if (!episode) return null;

  let related = episode.related ?? [];
  if (related.length < 3) {
    const others = (await getAllPodcasts()).filter(
      (p) => p.slug !== slug && !related.some((r) => r._id === p._id),
    );
    const sameTag = others.filter((p) => p.tag === episode.tag);
    const rest = others.filter((p) => p.tag !== episode.tag);
    related = [...related, ...sameTag, ...rest].slice(0, 3);
  }

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
