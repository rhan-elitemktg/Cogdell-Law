/**
 * Seeds the /testimonials wall header (eyebrow, heading, lede).
 *
 *   npx sanity exec scripts/seed-testimonials-wall.ts --with-user-token
 *
 * The quotes themselves are `testimonial` documents — see seed-testimonials.ts.
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const WALL = {
  _type: "testimonialsWallBand",
  eyebrow: "Client Testimonials",
  headingLead: "In Their",
  headingStrong: "Own Words.",
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
          text: "Across four decades of high-stakes trials, the people Dan Cogdell has defended have shared what representation at the highest level meant to them — often at the most difficult moment of their lives.",
        },
      ],
    },
  ],
};

async function main() {
  console.log(`Seeding testimonials wall header into "${client.config().dataset}"…`);
  await client.createIfNotExists({ _id: "testimonialsPage", _type: "testimonialsPage" });
  await client.patch("testimonialsPage").setIfMissing({ testimonialsWall: WALL }).commit();
  const got = await client.fetch(
    `*[_id == "testimonialsPage"][0].testimonialsWall{eyebrow, headingLead, headingStrong, "ledeBlocks": count(lede)}`,
  );
  console.log("  " + JSON.stringify(got));
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
