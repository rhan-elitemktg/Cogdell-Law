import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/** Page singletons that carry a "Why Choose" band. */
export type WhyChoosePageId = "homePage" | "attorneysPage";

const WHY_CHOOSE_BAND_QUERY = defineQuery(`*[_id == $pageId][0].whyChoose{
  eyebrow,
  headingLead,
  headingStrong,
  features[]{
    _key,
    icon,
    title,
    body
  }
}`);

/**
 * The "Why Choose" band for a given page. Each page owns its own copy (D11), so
 * the caller says which page it wants.
 */
export async function getWhyChooseBand(pageId: WhyChoosePageId) {
  return await sanityClient.fetch(WHY_CHOOSE_BAND_QUERY, { pageId });
}
