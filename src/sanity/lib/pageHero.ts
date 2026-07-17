import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const PAGE_HERO_QUERY = defineQuery(`*[_id == $pageId][0].hero{
  eyebrow,
  titleLead,
  titleStrong,
  lede
}`);

/** The hero copy for an interior page singleton (F16). */
export async function getPageHero(pageId: string) {
  return await sanityClient.fetch(PAGE_HERO_QUERY, { pageId });
}
