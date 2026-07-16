import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * The consult band renders on 13 pages — most of them dynamic routes with no page
 * document — so it's one shared record with an optional per-page override (D13).
 *
 * `coalesce` resolves override-over-default in a single query. When a page has no
 * document (or no override set), the first term is null and the shared default
 * wins.
 */
const CONSULT_QUERY = defineQuery(`coalesce(
  *[_id == $pageId][0].consult,
  *[_id == "consult"][0].content
){
  eyebrow,
  headingLead,
  headingStrong,
  body,
  fineprint,
  thankYou
}`);

/**
 * @param pageId Document id of the page, when it has one — lets that page's
 *   override win. Omit on routes with no page document; the shared default is used.
 */
export async function getConsult(pageId?: string) {
  // A page id that can't exist, so the coalesce falls straight through.
  return await sanityClient.fetch(CONSULT_QUERY, { pageId: pageId ?? " none" });
}
