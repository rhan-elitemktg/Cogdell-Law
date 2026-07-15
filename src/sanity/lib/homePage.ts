import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

// `_key` is projected on array members per Sanity convention — it's what any
// future Visual Editing overlay keys off.
const HOME_HERO_QUERY = defineQuery(`*[_id == "homePage"][0].hero{
  eyebrow,
  titleAccent,
  titleSecond,
  lead,
  ctas[]{
    _key,
    label,
    href
  },
  caption{
    name,
    role,
    watchLabel,
    video->{
      wistiaId
    }
  }
}`);

/** Hero content for the homepage, from the Home Page singleton. */
export async function getHomeHero() {
  return await sanityClient.fetch(HOME_HERO_QUERY);
}

const HOME_SELLING_POINTS_QUERY = defineQuery(`*[_id == "homePage"][0].sellingPoints.points[]{
  _key,
  value,
  label
}`);

/**
 * The stats bar under the hero. Returned to the page rather than fetched inside
 * SellingPoints.astro, because that component is shared with /our-firm, which
 * passes its own set — so it stays presentational and takes props.
 */
export async function getHomeSellingPoints() {
  return await sanityClient.fetch(HOME_SELLING_POINTS_QUERY);
}

// `featured` resolves each reference and reads its teaser copy, falling back to
// the full case wording when a teaser field is blank.
const HOME_ABOUT_QUERY = defineQuery(`*[_id == "homePage"][0].about{
  eyebrow,
  titleLead,
  titleStrong,
  body,
  resultsEyebrow,
  quote,
  featured[]->{
    _id,
    "outcome": coalesce(teaser.outcome, outcome),
    "caseName": coalesce(teaser.title, name),
    "note": coalesce(teaser.note, note)
  }
}`);

/** About band content for the homepage, from the Home Page singleton. */
export async function getHomeAbout() {
  return await sanityClient.fetch(HOME_ABOUT_QUERY);
}

const HOME_STATEMENT_QUERY = defineQuery(`*[_id == "homePage"][0].statement{
  eyebrow,
  headingItalic,
  headingBold,
  body,
  cta{
    label,
    href
  }
}`);

/** The full-bleed statement band under the About section. */
export async function getHomeStatement() {
  return await sanityClient.fetch(HOME_STATEMENT_QUERY);
}

const HOME_FIRM_STORY_QUERY = defineQuery(`*[_id == "homePage"][0].firmStory{
  eyebrow,
  headingLead,
  headingStrong,
  body,
  cta{
    label,
    href
  }
}`);

/** The centred "Why Cogdell" story band over the courthouse photo. */
export async function getHomeFirmStory() {
  return await sanityClient.fetch(HOME_FIRM_STORY_QUERY);
}
