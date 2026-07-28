/**
 * Seeds the "The Cogdell Counsel" podcast episodes plus the podcastPage singleton
 * (the /podcast index hero copy).
 *
 *   npx sanity exec scripts/seed-podcasts.ts --with-user-token
 *
 * Source: scripts/data/podcasts.seed.json.
 *
 * Episodes 4–12 are the ones shown in the mockup; 1–3 are illustrative earlier
 * episodes so the index's "Load More" has something to reveal — delete or replace
 * them freely in the Studio.
 *
 * Each episode is seeded with a one-paragraph body (the summary) so the page
 * isn't empty; the firm expands the show notes, and adds the artwork photo, audio
 * URL and transcript in the Studio (those need asset uploads / real media, so
 * they aren't seeded here). Matched on slug, so re-running updates in place.
 */
import { getCliClient } from "sanity/cli";
import seed from "./data/podcasts.seed.json";

const client = getCliClient();

interface SeedEpisode {
  episodeNumber: number;
  slug: string;
  title: string;
  tag: string;
  publishedAt: string;
  summary: string;
}

const episodes = seed as SeedEpisode[];

const compact = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)));

// A minimal blockContent body from a single paragraph of text.
const paragraph = (slug: string, text: string) => [
  {
    _type: "block",
    _key: `${slug}-p1`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${slug}-p1s`, marks: [], text }],
  },
];

async function main() {
  console.log(`Seeding ${episodes.length} podcast episodes into "${client.config().dataset}"…`);

  for (const ep of episodes) {
    const doc = compact({
      _type: "podcast",
      title: ep.title,
      episodeNumber: ep.episodeNumber,
      slug: { _type: "slug", current: ep.slug },
      tag: ep.tag,
      publishedAt: new Date(ep.publishedAt).toISOString(),
      summary: ep.summary,
      body: paragraph(ep.slug, ep.summary),
    });

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "podcast" && slug.current == $slug][0]{_id}`,
      { slug: ep.slug },
    );

    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
    } else {
      await client.create(doc);
    }
    console.log(`  Ep. ${ep.episodeNumber} — ${ep.title.slice(0, 48)}`);
  }

  // /podcast index hero copy (F16 — page copy on the podcastPage singleton).
  await client.createIfNotExists({ _id: "podcastPage", _type: "podcastPage" });
  await client
    .patch("podcastPage")
    .setIfMissing({
      hero: {
        eyebrow: "News & Insights",
        title: "The Cogdell Counsel Podcast",
        subtitle:
          "Candid conversations on federal investigations, white collar defense, and four decades of high-profile victories — straight from the trial lawyers who win the cases others call unwinnable.",
      },
    })
    .commit();
  console.log("  podcastPage.hero copy");

  console.log("Done. Add each episode's artwork photo, audio URL and transcript in the Studio.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
