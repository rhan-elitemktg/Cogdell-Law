import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * The "Reviewed By" panel at the top of the practice-area rail (D18).
 *
 * The reviewer resolves in three steps, so the panel works with no setup at all
 * and can still be pinned:
 *
 *   1. the page's own `reviewedBy`, when it names one
 *   2. Site Settings → Firm Details → Default reviewer
 *   3. the first attorney in Collections → Attorney Bios
 *
 * Step 3 is the zero-config floor rather than the intended resting state: it
 * follows the drag order of that list, so reordering attorneys would change who
 * gets credited. Set the default in Firm Details to pin it.
 *
 * `_createdAt` / `_updatedAt` are the published document's, and drive the
 * Published-vs-Updated wording — see `ReviewedBy.astro`, which compares the two
 * as formatted dates rather than as instants.
 */
const REVIEWED_BY_QUERY = defineQuery(`{
  "reviewer": coalesce(
    *[_id == $pageId][0].reviewedBy->,
    *[_id == "firmDetails"][0].defaultReviewer->,
    *[_type == "attorney"] | order(orderRank)[0]
  ){
    name,
    role,
    photo,
    photoAlt,
    "slug": slug.current
  },
  "createdAt": *[_id == $pageId][0]._createdAt,
  "updatedAt": *[_id == $pageId][0]._updatedAt
}`);

/**
 * @param pageId Document id of the page — resolves its reviewer and its dates.
 */
export async function getReviewedBy(pageId: string) {
  return await sanityClient.fetch(REVIEWED_BY_QUERY, { pageId });
}
