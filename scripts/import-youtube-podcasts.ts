/**
 * Imports the YouTube back-catalogue as `podcast` documents.
 *
 *   node scripts/fetch-youtube-episodes.mjs          # harvest first (writes the JSON)
 *   npx sanity exec scripts/import-youtube-podcasts.ts --with-user-token
 *   npx sanity exec scripts/import-youtube-podcasts.ts --with-user-token -- --dry
 *
 * Reads scripts/data/youtube-episodes.json (committed, so this is reproducible
 * and reviewable) and writes one document per video.
 *
 * ⚠️ DISABLE THE "Sanity Publish" WEBHOOK BEFORE RUNNING. Every write fires the
 * Vercel deploy hook, and this makes 80 of them. Re-enable it afterwards and
 * trigger one deploy by hand.
 *
 * Idempotent: documents use the deterministic id `podcast-yt-<youtubeId>`, so a
 * re-run updates in place rather than duplicating. Run it again after adding
 * videos to the channel and only the new ones appear.
 */
import { getCliClient } from "sanity/cli";
import { readFileSync } from "node:fs";

const client = getCliClient();
const DRY = process.argv.includes("--dry");

/**
 * The two episodes that already existed in Sanity, hand-authored, with live URLs
 * and real show notes. They ARE in the harvest, but their slugs were written by a
 * person and don't match what slugify() produces:
 *
 *   x6zwhAANhcY → …-robert-durst          (derived would be …-robert-durst-dick-deguerin)
 *   0srbD2hn2vM → unity-over-division     (derived would be unity-over-division-james-talarico)
 *
 * Creating them fresh would leave two orphaned duplicate pages AND move two
 * indexed URLs. So they are patched, never recreated: youtubeId goes on, the
 * dead Spotify-era fields come off, everything else is left exactly as written.
 */
const LEGACY: Record<string, string> = {
  x6zwhAANhcY: "defending-in-murder-trials-cult-leaders-and-robert-durst",
  "0srbD2hn2vM": "unity-over-division",
};

/** Fields that no longer exist on the schema. Removing a field from the schema
 *  does NOT delete stored values — they linger invisibly and would resurface if
 *  the field were ever re-added, so clear them explicitly. */
const DEAD_FIELDS = ["spotifyUrl", "chapters", "episodeNumber", "tag"];

// Trailing channel boilerplate, optionally followed by an episode marker
// ("| Cogdell Law Uncensored Ep #3"). 74 of the 82 titles carry it.
const SUFFIX = /\s*\|\s*Cogdell Law Uncensored(?:\s*Ep\.?\s*#?\s*\d+)?\s*$/i;

// Paragraphs repeated verbatim across the catalogue. Matched by opening phrase
// rather than in full, because the tails drift between videos.
const BOILERPLATE = [
  /^welcome to cogdell law uncensored/i,
  /^hosted by veteran criminal defense attorney/i,
  /^dan brings decades of trial experience/i,
  /^(follow|subscribe|connect with|watch more|#)/i,
];

interface Harvested {
  id: string;
  duration: number | null;
  rawTitle: string;
  uploadDate: string | null;
  description: string;
}

const cleanTitle = (raw: string) => raw.replace(SUFFIX, "").replace(/\s{2,}/g, " ").trim();

/** Lowercase, ASCII-fold, hyphenate — then trim to the schema's 96-char cap on a
 *  word boundary rather than mid-token ("…-defense-law" from "…-defense-lawyer"). */
function slugify(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (base.length <= 96) return base;
  const cut = base.slice(0, 96);
  return cut.slice(0, cut.lastIndexOf("-")).replace(/-+$/, "");
}

/** Description paragraphs with the repeated channel blurbs removed. */
const realParagraphs = (description: string) =>
  description
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0 && !BOILERPLATE.some((re) => re.test(p)));

/** YYYYMMDD → ISO at noon UTC. Noon, not midnight: the cards format with
 *  toLocaleDateString, and a midnight-UTC stamp renders as the previous day on
 *  any build machine west of UTC. */
function isoDate(yyyymmdd: string | null): string | undefined {
  if (!yyyymmdd || !/^\d{8}$/.test(yyyymmdd)) return undefined;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T12:00:00.000Z`;
}

const toBlocks = (paragraphs: string[], id: string) =>
  paragraphs.map((text, i) => ({
    _type: "block",
    _key: `${id}-p${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${id}-s${i}`, text, marks: [] }],
  }));

async function main() {
  const raw = readFileSync("scripts/data/youtube-episodes.json", "utf8");
  const episodes: Harvested[] = JSON.parse(raw).episodes;
  console.log(`${episodes.length} episodes in the harvest${DRY ? "  (DRY RUN — no writes)" : ""}\n`);

  const seenSlugs = new Map<string, string>();
  let patched = 0;
  let created = 0;

  for (const ep of episodes) {
    const legacySlug = LEGACY[ep.id];

    if (legacySlug) {
      // Patch by slug — we don't know the existing document's _id, and matching
      // on the slug is what guarantees we hit the hand-authored one.
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_type == "podcast" && slug.current == $slug][0]{_id}`,
        { slug: legacySlug },
      );
      if (!existing) {
        console.warn(`  !! legacy episode "${legacySlug}" not found — skipping ${ep.id}`);
        continue;
      }
      console.log(`  patch  ${ep.id}  ${legacySlug}`);
      if (!DRY) {
        await client.patch(existing._id).set({ youtubeId: ep.id }).unset(DEAD_FIELDS).commit();
      }
      patched++;
      continue;
    }

    const title = cleanTitle(ep.rawTitle);
    let slug = slugify(title);

    // Verified zero collisions across the current 82, but a silent second
    // document at a near-identical URL is the worst failure mode here, so say so
    // loudly rather than trusting that to hold as the channel grows.
    if (seenSlugs.has(slug)) {
      console.warn(`  !! slug collision "${slug}" between ${seenSlugs.get(slug)} and ${ep.id} — suffixing`);
      slug = `${slug}-2`;
    }
    seenSlugs.set(slug, ep.id);

    const paragraphs = realParagraphs(ep.description);
    const doc = {
      _id: `podcast-yt-${ep.id}`,
      _type: "podcast",
      title,
      youtubeId: ep.id,
      slug: { _type: "slug", current: slug },
      ...(isoDate(ep.uploadDate) ? { publishedAt: isoDate(ep.uploadDate) } : {}),
      ...(paragraphs[0] ? { summary: paragraphs[0].slice(0, 300) } : {}),
      ...(paragraphs.length ? { body: toBlocks(paragraphs, ep.id) } : {}),
    };

    console.log(`  create ${ep.id}  ${slug}`);
    if (!DRY) await client.createOrReplace(doc);
    created++;
  }

  console.log(`\n${patched} patched, ${created} created${DRY ? " (dry run)" : ""}.`);
  if (!DRY) console.log("Re-enable the Sanity Publish webhook, then trigger one deploy.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
