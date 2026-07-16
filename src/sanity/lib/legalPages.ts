import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const LEGAL_PAGE_QUERY = defineQuery(`*[_id == $id][0]{
  title,
  intro,
  sections[]{
    _key,
    heading,
    body
  }
}`);

/** A legal page (privacy | disclaimer) by its fixed id. */
export async function getLegalPage(id: "privacy" | "disclaimer") {
  return await sanityClient.fetch(LEGAL_PAGE_QUERY, { id });
}
