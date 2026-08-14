/**
 * YouTube helpers. Framework-free and fetch-free on purpose.
 *
 * Thumbnail URLs are pure string construction from the video id, so nothing is
 * stored in Sanity (D8: derived media metadata belongs to the provider) and
 * nothing is fetched at build time. That second part is deliberate — the site
 * already fails its deploy if Wistia is unreachable, and putting 82 thumbnail
 * downloads on the critical path would double that exposure for no visible gain.
 */

/** The 11-character id YouTube uses in a watch URL. */
export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export const isYoutubeId = (id: string | null | undefined): id is string =>
  !!id && YOUTUBE_ID.test(id);

/**
 * Thumbnail for a video, plus the rung to fall back to.
 *
 * `maxresdefault` is 1280x720 and the only large 16:9 rung, but it exists ONLY
 * for videos uploaded at 720p or better — two on this channel have none, and
 * YouTube never backfills them. `hqdefault` always exists; it is 4:3 with
 * letterbox bars, which `object-fit: cover` crops away on a 16:9 container.
 *
 * Returns undefined for a missing or malformed id so callers can fall back
 * rather than build a URL out of junk.
 */
export function youtubeThumbnail(id: string | null | undefined) {
  if (!isYoutubeId(id)) return undefined;
  return {
    src: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    fallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/** The privacy-preserving embed URL — no cookie is set until playback starts. */
export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

/** The canonical watch URL, used as the no-JS fallback for play controls. */
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
