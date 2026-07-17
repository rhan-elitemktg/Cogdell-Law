import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * The consultation band's copy — ONE shared record used on every page.
 *
 * There used to be an optional per-page override (D13); the firm removed it, so
 * there is a single Consult everywhere. The photo is still a per-page prop (art
 * direction, D6).
 */
const CONSULT_QUERY = defineQuery(`*[_id == "consult"][0].content{
  eyebrow,
  headingLead,
  headingStrong,
  body,
  fineprint,
  thankYou
}`);

export async function getConsult() {
  return await sanityClient.fetch(CONSULT_QUERY);
}
