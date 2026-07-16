/**
 * Seeds the 6 `faq` documents from Faq.astro, plus the homepage FAQ band header.
 *
 *   npx sanity exec scripts/seed-faqs.ts --with-user-token
 *
 * Source: scripts/data/faqs.seed.json — frozen from Faq.astro's array.
 * Answers become blockContent (one `normal` block each); no formatting is
 * invented, so rendering is unchanged.
 *
 * Ranks use `lexorank` (D2), preserving the hardcoded order. Matched on the
 * question, so re-running updates rather than duplicating.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import seed from "./data/faqs.seed.json";

const client = getCliClient();

const faqs = seed as Array<{ q: string; a: string }>;

const answerBlocks = (text: string) => [
  {
    _type: "block",
    _key: "a1",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "a1s", text, marks: [] }],
  },
];

const BAND = {
  _type: "faqBand",
  eyebrow: "Common Questions",
  headingLead: "Answers to the Questions",
  headingStrong: "That Matter Most.",
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
          text: "We understand that facing a serious legal matter raises urgent questions. Here are answers to some of the most common inquiries we receive.",
        },
      ],
    },
  ],
};

async function main() {
  console.log(`Seeding ${faqs.length} FAQs into "${client.config().dataset}"…`);

  let rank = LexoRank.middle();
  const ids: string[] = [];
  for (const item of faqs) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "faq" && question == $q][0]{_id}`,
      { q: item.q },
    );
    const doc = {
      _type: "faq",
      question: item.q,
      answer: answerBlocks(item.a),
      orderRank: rank.toString(),
    };
    let id: string;
    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
      id = existing._id;
    } else {
      id = (await client.create(doc))._id;
    }
    ids.push(id);
    console.log(`  ${item.q}`);
    rank = rank.genNext();
  }

  // The band curates which FAQs the homepage shows — seed it with all six, in
  // order, matching what the site rendered before. Editors then add/remove.
  const questions = ids.map((id, i) => ({
    _type: "reference",
    _ref: id,
    _key: `faq${i}`,
  }));

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });
  await client
    .patch("homePage")
    .setIfMissing({ faq: BAND })
    .setIfMissing({ "faq.questions": questions })
    .commit();
  console.log("  homePage.faq band header + questions");
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
