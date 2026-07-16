import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const FAQS_QUERY = defineQuery(`*[_type == "faq"] | order(orderRank){
  _id,
  question,
  answer
}`);

/**
 * Every FAQ, in the Studio's drag-set order (D2). The homepage curates its own
 * subset via the band's `questions` reference array — this is for a future /faq
 * page or other full listing.
 */
export async function getFaqs() {
  return (await sanityClient.fetch(FAQS_QUERY)) ?? [];
}

const FAQ_BAND_QUERY = defineQuery(`*[_id == "homePage"][0].faq{
  eyebrow,
  headingLead,
  headingStrong,
  lede,
  questions[]->{
    _id,
    question,
    answer
  }
}`);

/** The homepage FAQ band header. */
export async function getFaqBand() {
  return await sanityClient.fetch(FAQ_BAND_QUERY);
}
