import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/**
 * The editor-managed redirects, straight from the Studio (Site Settings → Global
 * SEO Settings → Redirects). Consumed only by src/pages/bulk-redirects.json.ts.
 *
 * Ordered by `source` so the generated file has a stable diff between builds —
 * otherwise every deploy churns the whole thing and the build log is useless for
 * spotting what an editor actually changed.
 */
const REDIRECTS_QUERY = defineQuery(`*[_type == "redirect"] | order(source asc){
  _id,
  source,
  destination,
  permanent
}`);

export async function getRedirects() {
  return (await sanityClient.fetch(REDIRECTS_QUERY)) ?? [];
}
