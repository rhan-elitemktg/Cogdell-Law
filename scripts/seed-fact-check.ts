/**
 * Seeds the site-wide Fact-Checked Banner (D17).
 *
 *   npx sanity exec scripts/seed-fact-check.ts --with-user-token
 *
 * One shared record shown at the foot of every practice area and location page.
 * A page that needs different wording fills in its own override; a page that
 * shouldn't show one turns its toggle off (D13).
 *
 * The banner renders only when this record has a statement, so until this runs
 * the toggle is on everywhere and nothing appears — no broken build, no empty
 * card. Run it, then edit the wording in the Studio.
 *
 * setIfMissing, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const CONTENT = {
  _type: "factCheckContent",
  label: "Fact-Checked",
  body: [
    {
      _type: "block",
      _key: "fc1",
      style: "normal",
      markDefs: [
        { _type: "link", _key: "guidelines", href: "/editorial-guidelines" },
        { _type: "link", _key: "attorney", href: "/attorney/dan-cogdell" },
      ],
      children: [
        {
          _type: "span",
          _key: "fc1a",
          marks: [],
          text: "This page has been written, edited, and reviewed by a team of legal writers following our comprehensive ",
        },
        {
          _type: "span",
          _key: "fc1b",
          marks: ["guidelines"],
          text: "editorial guidelines",
        },
        {
          _type: "span",
          _key: "fc1c",
          marks: [],
          text: ". This page was approved by Founding Attorney, ",
        },
        {
          _type: "span",
          _key: "fc1d",
          marks: ["attorney"],
          text: "Dan Cogdell",
        },
        {
          _type: "span",
          _key: "fc1e",
          marks: [],
          text: " who has more than 40 years of legal experience as a criminal defense attorney.",
        },
      ],
    },
  ],
};

async function main() {
  console.log(`Seeding Fact-Checked Banner into "${client.config().dataset}"…`);

  await client.createIfNotExists({ _id: "factCheck", _type: "factCheck" });
  await client.patch("factCheck").setIfMissing({ content: CONTENT }).commit();

  const written = await client.fetch<Record<string, unknown>>(
    `*[_id == "factCheck"][0].content{label, "bodyBlocks": count(body), "links": body[0].markDefs[].href}`,
  );
  console.log(JSON.stringify(written, null, 2).replace(/^/gm, "  "));
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
