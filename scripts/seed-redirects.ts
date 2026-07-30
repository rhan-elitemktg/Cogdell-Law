/**
 * Seeds the legacy 301s that used to be hardcoded in vercel.json as `redirect`
 * documents, so the SEO team can see and edit every redirect in one Studio list
 * (Site Settings → Global SEO Settings → Redirects).
 *
 *   npx sanity exec scripts/seed-redirects.ts --with-user-token
 *
 * Only the seven exact-match rules move. The wildcard rule
 * (/health-care-fraud-defense/:path*) stays in vercel.json — Vercel's bulk
 * redirects, which is what these documents become at build time, don't support
 * wildcards.
 *
 * Deterministic `_id`s + createIfNotExists, so re-running won't duplicate a rule
 * or clobber an edit someone has since made in the Studio.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const REDIRECTS = [
  {
    source: "/beaumont-federal-criminal-defense-attorney",
    destination: "/beaumont/beaumont-federal-criminal-defense-attorney",
  },
  {
    source: "/sherman-federal-criminal-defense-lawyers",
    destination: "/sherman/sherman-federal-criminal-defense-lawyers",
  },
  {
    source: "/dallas-federal-criminal-defense-lawyers",
    destination: "/dallas/dallas-federal-criminal-defense-lawyers",
  },
  {
    source: "/dallas-health-care-fraud-defense-lawyer",
    destination: "/dallas/dallas-health-care-fraud-defense-lawyer",
  },
  {
    source: "/houston-healthcare-fraud-defense-law-office",
    destination: "/houston/houston-healthcare-fraud-defense-law-office",
  },
  {
    source: "/fort-worth-health-care-fraud-defense-lawyer",
    destination: "/fort-worth/fort-worth-health-care-fraud-defense-lawyer",
  },
  {
    source: "/fort-worth-federal-criminal-defense-lawyers",
    destination: "/fort-worth/fort-worth-federal-criminal-defense-lawyers",
  },
];

/** "/dallas-federal-criminal-defense-lawyers" → "redirect-dallas-federal-criminal-defense-lawyers" */
const idFor = (source: string) =>
  `redirect-${source.replace(/^\//, "").replace(/[^a-z0-9-]/gi, "-")}`;

async function main() {
  console.log(`Seeding ${REDIRECTS.length} legacy redirects into "${client.config().dataset}"…`);
  for (const rule of REDIRECTS) {
    const _id = idFor(rule.source);
    await client.createIfNotExists({ _id, _type: "redirect" });
    await client
      .patch(_id)
      .setIfMissing({ source: rule.source, destination: rule.destination, permanent: true })
      .commit();
    console.log(`  ${rule.source} → ${rule.destination}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
