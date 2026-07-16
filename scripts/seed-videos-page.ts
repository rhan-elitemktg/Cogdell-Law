/**
 * Seeds the /videos page grid header (F16 — page copy on the videosPage singleton).
 *
 *   npx sanity exec scripts/seed-videos-page.ts --with-user-token
 *
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";
const client = getCliClient();

async function main() {
  await client.createIfNotExists({ _id: "videosPage", _type: "videosPage" });
  await client
    .patch("videosPage")
    .setIfMissing({ grid: { eyebrow: "Watch", headingLead: "From the", headingStrong: "Firm." } })
    .commit();
  console.log("videosPage.grid seeded.");
}
main().catch((e) => { console.error(e); process.exit(1); });
