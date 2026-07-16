import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const OUR_FIRM_QUERY = defineQuery(`*[_id == "ourFirmPage"][0]{
  hero,
  intro{ eyebrow, headingLead, headingStrong, body },
  stats{ items[]{ _key, value, label } },
  quote{ lead, accent, attribution },
  foundingAttorney{ eyebrow, headingLead, headingStrong, body },
  originStory{ eyebrow, headingLead, headingStrong, body, milestones[]{ _key, key, title, desc } },
  values{ eyebrow, headingLead, headingStrong, items[]{ _key, icon, title, body } }
}`);

/** All Our Firm page copy. */
export async function getOurFirm() {
  return await sanityClient.fetch(OUR_FIRM_QUERY);
}
