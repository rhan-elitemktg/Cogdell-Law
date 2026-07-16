import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/** Page singletons that carry a practice-areas band. */
export type BandPageId = "homePage" | "trialExperiencePage" | "testimonialsPage";

const PRACTICE_AREAS_BAND_QUERY = defineQuery(`*[_id == $pageId][0].practiceAreas{
  eyebrow,
  headingLead,
  headingStrong,
  description,
  cards[]{
    _key,
    icon,
    title,
    desc
  }
}`);

/**
 * The "What We Try" band for a given page.
 *
 * Each page owns its own copy, so the caller says which page it wants — the same
 * band renders on the homepage, /trial-experience and /testimonials with
 * independently editable content.
 */
export async function getPracticeAreasBand(pageId: BandPageId) {
  return await sanityClient.fetch(PRACTICE_AREAS_BAND_QUERY, { pageId });
}
