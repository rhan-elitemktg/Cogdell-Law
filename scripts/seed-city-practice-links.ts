/**
 * Fills in each Service City's "Extra practice areas in the menu", from the
 * SEO team's sheet.
 *
 *   npx sanity exec scripts/seed-city-practice-links.ts --with-user-token
 *   npx sanity exec scripts/seed-city-practice-links.ts --with-user-token -- --dry
 *
 * These APPEND to a city's own location pages in the nav — they never replace
 * them. `getAreasWeServeNav()` lists the location pages first and skips any
 * practice area whose title duplicates one, so a city that later gets its own
 * page for a service drops the generic link automatically.
 *
 * Source: the "Areas We Frequently Serve" sheet, 14 August 2026. The sheet's
 * "White Collar Crimes" is recorded here by its slug — the document is titled
 * "White Collar Defense", and the menu takes its label from the document so it
 * can't drift from the page it points at.
 *
 * Safe to re-run: it sets the whole array each time, so editing the map here and
 * re-running is how you change it. Editors can also just edit the field in the
 * Studio, and this script is not meant to be run again afterwards.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();
const DRY = process.argv.includes("--dry");

/**
 * citySlug → practice-area slugs, in the order the submenu should read.
 *
 * Every city gets the SAME list, which is what makes them all read in the same
 * order. The list is the full set of services, not just the ones lacking a page:
 * `getAreasWeServeNav()` swaps in a city's own location page wherever it has one
 * for that service, so Fort Worth and Houston no longer sort differently just
 * because they happen to own different pages.
 */
const SERVICES = [
  "federal-criminal-cases",
  "health-care-fraud-defense",
  "white-collar-crimes",
  "fraud",
  "appeals",
];

const LINKS: Record<string, string[]> = {
  beaumont: SERVICES,
  dallas: SERVICES,
  "fort-worth": SERVICES,
  houston: SERVICES,
  sherman: SERVICES,
};

async function main() {
  const areas: { _id: string; slug: string; title: string }[] = await client.fetch(
    `*[_type == "practiceArea" && defined(slug.current)]{_id, "slug": slug.current, title}`,
  );
  const bySlug = new Map(areas.map((a) => [a.slug, a]));

  const cities: { _id: string; city: string; citySlug: string }[] = await client.fetch(
    `*[_type == "serviceCity"]{_id, city, "citySlug": citySlug.current}`,
  );

  for (const [citySlug, slugs] of Object.entries(LINKS)) {
    const city = cities.find((c) => c.citySlug === citySlug);
    if (!city) {
      console.warn(`  !! no Service City with slug "${citySlug}" — skipping`);
      continue;
    }

    const missing = slugs.filter((s) => !bySlug.has(s));
    if (missing.length) {
      console.warn(`  !! ${city.city}: no practice area for ${missing.join(", ")} — skipping those`);
    }

    const refs = slugs
      .filter((s) => bySlug.has(s))
      .map((s) => ({ _type: "reference", _ref: bySlug.get(s)!._id, _key: s }));

    console.log(`  ${city.city}: ${refs.map((r) => bySlug.get(r._key)!.title).join(", ")}`);
    if (!DRY) await client.patch(city._id).set({ practiceAreaLinks: refs }).commit();
  }

  console.log(DRY ? "\nDry run — nothing written." : "\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
