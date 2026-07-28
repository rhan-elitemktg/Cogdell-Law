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

/**
 * Cached for the whole production build; refetched every call in dev, so a phone
 * or address edit in the Studio shows up on the next refresh. Same arrangement
 * as src/sanity/lib/practiceAreas.ts.
 *
 * Worth caching because this singleton is asked for constantly: Layout, Header,
 * Footer, ContactMethods and every body CTA block want it, so it was 3-4+
 * identical round-trips per page across ~45 pages, with useCdn: false.
 *
 * The cache holds the PROMISE, not the resolved value — components render
 * concurrently, so caching the value would let several fetches start before any
 * of them resolved.
 */
let firmCache: ReturnType<typeof fetchFirmDetails> | null = null;

function fetchFirmDetails() {
  return sanityClient.fetch(FIRM_DETAILS_QUERY);
}

/** Site-wide firm identity — name, tagline, contact, address, socials, logo. */
export async function getFirmDetails() {
  if (import.meta.env.PROD) {
    firmCache ??= fetchFirmDetails();
    return await firmCache;
  }
  return await fetchFirmDetails();
}
