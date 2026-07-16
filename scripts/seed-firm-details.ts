/**
 * Expands the Firm Details singleton with the footer's identity content that was
 * hardcoded in Footer.astro (tagline, email, address, social links).
 *
 *   npx sanity exec scripts/seed-firm-details.ts --with-user-token
 *
 * Socials were `href="#"` placeholders in code — seeded as "#" so the footer is
 * unchanged until the firm sets real URLs.
 *
 * setIfMissing per field, so it won't clobber existing Firm Details. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const FIELDS = {
  tagline:
    "Trusted Texas counsel for high-stakes federal and white collar criminal defense — legal triumphs are a tradition.",
  email: "info@cogdell-law.com",
  address: {
    street: "712 Main St., Suite 2400",
    cityStateZip: "Houston, TX 77002",
  },
  socials: [
    { _key: "facebook", _type: "social", platform: "facebook", url: "#" },
    { _key: "x", _type: "social", platform: "x", url: "#" },
    { _key: "linkedin", _type: "social", platform: "linkedin", url: "#" },
  ],
  copyrightNotice: "All rights reserved.",
  legalLinks: [
    { _key: "privacy", _type: "legalLink", label: "Privacy Policy", href: "/privacy" },
    { _key: "disclaimer", _type: "legalLink", label: "Disclaimer", href: "/disclaimer" },
  ],
};

async function main() {
  console.log(`Expanding Firm Details in "${client.config().dataset}"…`);
  await client.createIfNotExists({ _id: "firmDetails", _type: "firmDetails" });
  const patch = client.patch("firmDetails");
  for (const [key, value] of Object.entries(FIELDS)) {
    patch.setIfMissing({ [key]: value });
  }
  await patch.commit();
  const got = await client.fetch(
    `*[_id == "firmDetails"][0]{title, "tagline": defined(tagline), email, "address": address.cityStateZip, "socials": count(socials)}`,
  );
  console.log("  " + JSON.stringify(got));
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
