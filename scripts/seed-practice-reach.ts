/**
 * Seeds the Home Page "Where We Practice" band with the copy that was hardcoded
 * in PracticeReach.astro.
 *
 *   npx sanity exec scripts/seed-practice-reach.ts --with-user-token
 *
 * The US map beside it is fixed SVG reference geometry (data/us-states.ts) and
 * stays in code — it isn't content.
 *
 * setIfMissing per field, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const PRACTICE_REACH = {
  eyebrow: "Where We Practice",
  headingLead: "Based in Houston.",
  headingStrong: "Available Nationwide.",
  lede: [
    {
      _type: "block",
      _key: "p1",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "p1s",
          marks: [],
          text: "Our principal office is in downtown Houston, but our practice reaches every federal courtroom in the country. We regularly try cases across Texas and in federal districts nationwide — wherever our clients need us, we go.",
        },
      ],
    },
  ],
  stats: [
    { _key: "office", _type: "practiceReachStat", label: "Principal Office", value: "Houston, Texas" },
    { _key: "state", _type: "practiceReachStat", label: "State Courts", value: "Throughout Texas" },
    { _key: "federal", _type: "practiceReachStat", label: "Federal Courts", value: "Nationwide" },
  ],
};

async function main() {
  console.log(`Seeding practice-reach into "${client.config().dataset}"…`);
  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });
  const patch = client.patch("homePage");
  for (const [key, value] of Object.entries(PRACTICE_REACH)) {
    patch.setIfMissing({ [`practiceReach.${key}`]: value });
  }
  await patch.commit();
  const got = await client.fetch(
    `*[_id == "homePage"][0].practiceReach{eyebrow, headingLead, headingStrong, "ledeBlocks": count(lede), "stats": count(stats)}`,
  );
  console.log("  " + JSON.stringify(got));
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
