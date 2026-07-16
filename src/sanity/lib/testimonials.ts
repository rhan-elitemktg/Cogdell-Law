import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * One pool of testimonials, shown two ways:
 *
 *  - /testimonials — all of them, in the Studio's drag-set order (D2)
 *  - the homepage / /attorneys band — the ones toggled `featured`
 *
 * The `[0...3]` slice is a backstop only: the schema already caps `featured` at
 * three via async validation. It keeps the grid intact if that cap is ever
 * bypassed (an import, a script, a draft in an invalid state).
 */
const FEATURED_TESTIMONIALS_QUERY = defineQuery(`*[
  _type == "testimonial" && featured == true
] | order(orderRank) [0...3]{
  _id,
  quote,
  author,
  tag
}`);

/** The featured quotes for the homepage / attorneys band. */
export async function getFeaturedTestimonials() {
  return (await sanityClient.fetch(FEATURED_TESTIMONIALS_QUERY)) ?? [];
}

const ALL_TESTIMONIALS_QUERY = defineQuery(`*[_type == "testimonial"] | order(orderRank){
  _id,
  quote,
  author
}`);

/** Every testimonial, for the wall on /testimonials. */
export async function getAllTestimonials() {
  return (await sanityClient.fetch(ALL_TESTIMONIALS_QUERY)) ?? [];
}

/** Page singletons that carry a featured-testimonials band. */
export type TestimonialsBandPageId = "homePage" | "attorneysPage";

const TESTIMONIALS_BAND_QUERY = defineQuery(`*[_id == $pageId][0].testimonials{
  eyebrow,
  headingLead,
  headingStrong
}`);

/** The band's header copy for a given page — each page owns its own (D11). */
export async function getTestimonialsBand(pageId: TestimonialsBandPageId) {
  return await sanityClient.fetch(TESTIMONIALS_BAND_QUERY, { pageId });
}

const TESTIMONIALS_WALL_BAND_QUERY = defineQuery(`*[_id == "testimonialsPage"][0].testimonialsWall{
  eyebrow,
  headingLead,
  headingStrong,
  lede
}`);

/** The /testimonials wall header. */
export async function getTestimonialsWallBand() {
  return await sanityClient.fetch(TESTIMONIALS_WALL_BAND_QUERY);
}
