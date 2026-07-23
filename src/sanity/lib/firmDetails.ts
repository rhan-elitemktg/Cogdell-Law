import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const FIRM_DETAILS_QUERY = defineQuery(`*[_id == "firmDetails"][0]{
  title,
  tagline,
  phone,
  email,
  address,
  socials[]{
    platform,
    url
  },
  copyrightNotice,
  legalLinks[]{
    label,
    href
  },
  logo{
    ...,
    "dimensions": asset->metadata.dimensions
  }
}`);

/** Site-wide firm identity — name, tagline, contact, address, socials, logo. */
export async function getFirmDetails() {
  return await sanityClient.fetch(FIRM_DETAILS_QUERY);
}
