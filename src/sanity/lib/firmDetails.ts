import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const FIRM_DETAILS_QUERY = defineQuery(`*[_id == "firmDetails"][0]{
  title,
  phone,
  logo{
    ...,
    "dimensions": asset->metadata.dimensions
  }
}`);

/** Site-wide globals (firm name, phone, logo) from the Firm Details singleton. */
export async function getFirmDetails() {
  return await sanityClient.fetch(FIRM_DETAILS_QUERY);
}
