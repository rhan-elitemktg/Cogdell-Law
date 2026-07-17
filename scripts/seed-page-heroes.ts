/**
 * Seeds the interior-page hero copy (eyebrow / title / lede) that was hardcoded
 * as PageHero props on each page.
 *
 *   npx sanity exec scripts/seed-page-heroes.ts --with-user-token
 *
 * Hero images + CTA buttons stay in code. setIfMissing, safe to re-run.
 */
import { getCliClient } from "sanity/cli";
const client = getCliClient();

const HEROES: Record<string, { eyebrow: string; titleLead?: string; titleStrong: string; lede?: string }> = {
  attorneysPage: { eyebrow: "Our Attorneys", titleLead: "Tenacious Advocacy", titleStrong: "Backed by Proven Experience.", lede: "Facing federal criminal charges or other serious allegations? Since 1988, Cogdell Law Firm has provided strong, unyielding advocacy for Texans statewide. Our Houston-based lawyers bring over 40 years of experience to your defense." },
  testimonialsPage: { eyebrow: "Testimonials", titleLead: "When the Choice You Make", titleStrong: "Will Make All the Difference." },
  trialExperiencePage: { eyebrow: "Trial Experience", titleLead: "A Legacy of", titleStrong: "Legal Victories.", lede: "From Enron to the Branch Davidian trial to the Texas Attorney General, Dan Cogdell has defended and won the cases the nation was watching. Not settlements. Verdicts." },
  videosPage: { eyebrow: "Videos", titleLead: "The Firm,", titleStrong: "On the Record.", lede: "A closer look at Dan Cogdell and the firm — the work, the landmark cases, and four decades of courtroom experience, in their own words." },
  newsPage: { eyebrow: "News", titleLead: "Cogdell Law Firm", titleStrong: "In the News.", lede: "Our attorneys are known throughout Texas and nationally for handling high-profile, high-stakes cases — work that has been covered by local, national, and global media." },
  contactPage: { eyebrow: "Get in Touch", titleLead: "Connect", titleStrong: "With Us.", lede: "Whether you're facing federal charges, a government investigation, or a complex civil dispute — the first step is a confidential conversation." },
  practiceAreasPage: { eyebrow: "Practice Areas", titleLead: "Experienced Federal Criminal Defense", titleStrong: "When The Stakes Are High" },
};

async function main() {
  console.log(`Seeding page heroes into "${client.config().dataset}"…`);
  const tx = client.transaction();
  for (const [id, hero] of Object.entries(HEROES)) {
    tx.createIfNotExists({ _id: id, _type: id });
    tx.patch(id, (p) => p.setIfMissing({ hero: { _type: "pageHero", ...hero } }));
  }
  await tx.commit();
  for (const id of Object.keys(HEROES)) console.log(`  ${id}`);
  console.log("Done.");
}
main().catch((e) => { console.error(e); process.exit(1); });
