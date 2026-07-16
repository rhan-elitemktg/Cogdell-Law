import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

// Card order comes from `orderRank` — drag-to-reorder in the Studio (D2). A new
// attorney gets a rank at the end of the list, so they append rather than jump
// the queue, and the firm can reorder without a developer.
const ATTORNEY_CARDS_QUERY = defineQuery(`*[_type == "attorney"] | order(orderRank){
  _id,
  name,
  role,
  credential,
  photo,
  photoAlt,
  "slug": slug.current
}`);

/** Name + role + photo for the card grids, in the Studio's drag-set order. */
export async function getAttorneyCards() {
  return (await sanityClient.fetch(ATTORNEY_CARDS_QUERY)) ?? [];
}

const ATTORNEY_SLUGS_QUERY = defineQuery(
  `*[_type == "attorney" && defined(slug.current)]{"slug": slug.current}`,
);

/** Every attorney slug — for getStaticPaths. */
export async function getAttorneySlugs() {
  return await sanityClient.fetch(ATTORNEY_SLUGS_QUERY);
}

const ATTORNEY_QUERY = defineQuery(`*[_type == "attorney" && slug.current == $slug][0]{
  _id,
  name,
  role,
  credential,
  photo,
  photoAlt,
  phone,
  email,
  practiceTags,
  bio,
  education[]{
    _key,
    school,
    location,
    lines
  },
  barAdmissions,
  honors,
  classesSeminars,
  publishedWorks,
  associations,
  pastPositions,
  representativeCases,
  "slug": slug.current
}`);

/** One attorney's full record, for /attorney/[slug]. */
export async function getAttorney(slug: string) {
  return await sanityClient.fetch(ATTORNEY_QUERY, { slug });
}

/** The full attorney record, as the bio page and its components receive it. */
export type AttorneyDoc = NonNullable<Awaited<ReturnType<typeof getAttorney>>>;

/** Page singletons that carry an attorneys band. */
export type AttorneysBandPageId = "homePage" | "attorneysPage";

const ATTORNEYS_BAND_QUERY = defineQuery(`*[_id == $pageId][0].attorneys{
  eyebrow,
  headingLead,
  headingStrong,
  lede
}`);

/**
 * The attorney band's header copy for a given page. Each page owns its own copy
 * (D11), so the caller says which page it wants. The cards themselves come from
 * `getAttorneyCards()` — they're shared, not per-page.
 */
export async function getAttorneysBand(pageId: AttorneysBandPageId) {
  return await sanityClient.fetch(ATTORNEYS_BAND_QUERY, { pageId });
}
