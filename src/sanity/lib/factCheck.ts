import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * The fact-checked banner at the foot of every practice area and location page —
 * one shared record with an optional per-page override, plus a per-page toggle
 * (D13, D17).
 *
 * Both `coalesce`s matter:
 *
 *  - `show` — the banner is ON by default, and the pages that existed before the
 *    field was added carry no value at all. `coalesce(…, true)` makes a missing
 *    toggle mean "shown", so the default holds for old and new pages alike.
 *    Note this can't be written as `show != false`: in GROQ a comparison against
 *    null yields null, not true.
 *  - `content` — override over default, resolved in the one query.
 */
const FACT_CHECK_QUERY = defineQuery(`{
  "show": coalesce(*[_id == $pageId][0].factCheck.show, true),
  "content": coalesce(
    *[_id == $pageId][0].factCheck.content,
    *[_id == "factCheck"][0].content
  ){
    label,
    body
  }
}`);

/**
 * @param pageId Document id of the page — lets its toggle and override win.
 */
export async function getFactCheck(pageId: string) {
  return await sanityClient.fetch(FACT_CHECK_QUERY, { pageId });
}
