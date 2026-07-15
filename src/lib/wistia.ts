/**
 * Build-time metadata lookups against Wistia's public oEmbed endpoint.
 *
 * Wistia is the source of truth for a video's runtime and thumbnail, so neither
 * is stored in Sanity — a hand-typed value there could only drift from the real
 * media. See docs/sanity-integration.md (D8).
 *
 * This runs at build time only. It is a hard dependency: a failure fails the
 * build rather than silently shipping a hero with no poster.
 */

const OEMBED = "https://fast.wistia.com/oembed";
const TIMEOUT_MS = 10_000;
const ATTEMPTS = 3;

/** The poster size the design asks for. Wistia's oEmbed defaults to 960x540. */
const POSTER_WIDTH = 1280;
const POSTER_HEIGHT = 720;

export interface WistiaMeta {
  /** Display form for the card badge, e.g. "1:59". */
  duration: string;
  /** Thumbnail at POSTER_WIDTH x POSTER_HEIGHT. */
  poster: string;
  /** Wistia's own title — note the site uses its own curated titles. */
  title: string;
}

interface WistiaOEmbed {
  title: string;
  duration: number;
  thumbnail_url: string;
}

/** Seconds (Wistia returns a float) → "M:SS". Round, don't floor: 119.002 → "1:59". */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Wistia's thumbnails are one asset resized via a query param; oEmbed hands back
 * 960x540. Swap in the size we render rather than treating it as an opaque URL.
 */
function posterAt(thumbnailUrl: string, width: number, height: number): string {
  const url = new URL(thumbnailUrl);
  url.searchParams.set("image_crop_resized", `${width}x${height}`);
  return url.toString();
}

// One fetch per id per build — the hero and /videos ask for overlapping ids.
const cache = new Map<string, Promise<WistiaMeta>>();

async function fetchMeta(wistiaId: string): Promise<WistiaMeta> {
  const target = encodeURIComponent(`https://home.wistia.com/medias/${wistiaId}`);
  let lastError: unknown;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${OEMBED}?url=${target}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      // A missing/private video is a content error, not a blip — don't retry it.
      if (res.status === 404) {
        throw new Error(
          `Wistia has no video "${wistiaId}" (404). Check the Wistia ID in the Studio.`,
        );
      }
      if (!res.ok) throw new Error(`Wistia oEmbed returned ${res.status}`);

      const data = (await res.json()) as WistiaOEmbed;
      return {
        duration: formatDuration(data.duration),
        poster: posterAt(data.thumbnail_url, POSTER_WIDTH, POSTER_HEIGHT),
        title: data.title,
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes("(404)")) throw err;
      lastError = err;
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, attempt * 500));
    }
  }

  throw new Error(
    `Could not reach Wistia for video "${wistiaId}" after ${ATTEMPTS} attempts.\n` +
      `The build needs it for the poster and duration — Sanity doesn't store either.\n` +
      `Cause: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

/** Poster + duration for a Wistia id. Memoized for the life of the build. */
export function getWistiaMeta(wistiaId: string): Promise<WistiaMeta> {
  const hit = cache.get(wistiaId);
  if (hit) return hit;

  const pending = fetchMeta(wistiaId);
  cache.set(wistiaId, pending);
  // Don't cache a rejection — let a later caller retry.
  pending.catch(() => cache.delete(wistiaId));
  return pending;
}
