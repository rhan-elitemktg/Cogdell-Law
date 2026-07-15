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
