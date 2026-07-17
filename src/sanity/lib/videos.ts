import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import { getWistiaMeta } from "../../lib/wistia";

const VIDEOS_QUERY = defineQuery(`*[_type == "video"] | order(orderRank){
  _id,
  title,
  wistiaId
}`);

/**
 * All videos for /videos, in the Studio's drag-set order (D2), each enriched with
 * its poster + duration from Wistia (D8 — those aren't stored in Sanity).
 */
export async function getVideos() {
  const videos = (await sanityClient.fetch(VIDEOS_QUERY)) ?? [];
  return Promise.all(
    videos.map(async (v) => {
      const meta = await getWistiaMeta(v.wistiaId!);
      return { ...v, poster: meta.poster, duration: meta.duration };
    }),
  );
}

const VIDEO_GRID_HEADER_QUERY = defineQuery(`*[_id == "videosPage"][0].grid{
  eyebrow,
  headingLead,
  headingStrong
}`);

/** The /videos page grid header (F16 — page copy). */
export async function getVideoGridHeader() {
  return await sanityClient.fetch(VIDEO_GRID_HEADER_QUERY);
}
