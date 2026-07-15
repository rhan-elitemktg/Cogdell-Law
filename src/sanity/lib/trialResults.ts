import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

// Order comes from the page's reference array, not from a rank on the documents
// — each page curates its own list (D11).
const TRIAL_RESULTS_QUERY = defineQuery(`*[_id == "trialExperiencePage"][0].trialResults.cases[]->{
  _id,
  name,
  outcome,
  note,
  category,
  categoryLabel
}`);

/** The full case list for /trial-experience, in the page's curated order. */
export async function getTrialResults() {
  return await sanityClient.fetch(TRIAL_RESULTS_QUERY);
}
