/**
 * Creates the "Fort Worth Federal Criminal Defense" location page — the one old
 * URL (/fort-worth-federal-criminal-defense-lawyers/) that had no equivalent on
 * the new site. Content migrated from that page. New URL:
 * /fort-worth/fort-worth-federal-criminal-defense-lawyers/.
 *
 *   npx sanity exec scripts/seed-fort-worth-federal.ts --with-user-token
 *
 * Idempotent: createIfNotExists on a fixed id, so re-running won't clobber
 * Studio edits. Creates a PUBLISHED doc, so it appears on the next build (and
 * the publish webhook will trigger that build).
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import { toBlockContent } from "./lib/blockToPortableText";
import type { Block, Section } from "./lib/blockToPortableText";

const client = getCliClient();

const DOC_ID = "location-fort-worth-federal-criminal-defense";
const FORT_WORTH_CITY_ID = "kHQQtMLNbIJHgj7z80zwBe";

const INTRO: Block[] = [
  { p: "At the Cogdell Law Firm, we understand what is at stake when you face Fort Worth federal criminal defense charges. Our lawyers bring decades of trial experience and a proven track record of courtroom victories to clients throughout North Texas and East Texas, including the Dallas-Fort Worth metroplex." },
  { p: "Led by founding attorney Dan Cogdell, our firm has built a reputation throughout Texas as aggressive trial lawyers who fight to win. Whether you face white collar crime allegations, fraud charges, embezzlement accusations or other federal offenses, we provide the strategic defense representation you need during this critical time." },
];

const SECTIONS: Section[] = [
  {
    heading: "What Federal Charges Does The Firm Defend Against?",
    blocks: [
      { p: "Federal prosecutors pursue a wide range of criminal charges with significant resources and investigative power behind them. Our firm defends clients facing serious allegations that can result in lengthy prison sentences, substantial fines and permanent damage to professional reputations." },
      { p: "Common federal charges we handle include:" },
      { ul: [
        "White collar crimes: Business-related offenses involving financial deception, corporate misconduct or breach of fiduciary duties",
        "Fraud charges: Wire fraud, mail fraud, health care fraud, securities fraud and other schemes allegedly designed to obtain money or property through misrepresentation",
        "Embezzlement: Accusations of misappropriating funds, property entrusted to your care in a professional or fiduciary capacity",
        "Money laundering: Charges involving the concealment or disguising of illegally obtained funds through legitimate channels",
        "Tax evasion: Allegations of deliberately avoiding tax obligations through fraudulent means or willful noncompliance",
      ] },
      { p: "These charges often involve complex financial transactions and require attorneys who understand both the legal framework and the investigative methods federal agencies employ." },
    ],
  },
  {
    heading: "When Should You Contact A Federal Criminal Defense Lawyer?",
    blocks: [
      { p: "Federal charges are much more severe than other criminal charges. A federal conviction can lead to lifelong punishments, incarceration and fines. The moment you learn about a federal investigation targeting you or your business, you should immediately contact a federal criminal defense attorney. Early involvement allows us to protect your constitutional rights, guide you through interviews with federal agents and begin building your defense strategy before prosecutors file formal charges." },
    ],
  },
  {
    heading: "Contact The Cogdell Law Firm For Your Federal Criminal Defense",
    blocks: [
      { p: "At the Cogdell Law Firm, we bring aggressive advocacy and decades of trial experience to every federal criminal case we handle. Contact us online or call 713-426-2244 to discuss your federal criminal charges with our Fort Worth legal team today." },
    ],
  },
];

async function nextOrderRank(): Promise<string> {
  const ranks = await client.fetch<string[]>(
    `*[_type == "locationPage" && defined(orderRank)].orderRank`,
  );
  if (!ranks.length) return LexoRank.middle().toString();
  const max = ranks.sort().at(-1)!;
  return LexoRank.parse(max).genNext().toString();
}

async function main() {
  const dataset = client.config().dataset;
  const orderRank = await nextOrderRank();

  await client.createIfNotExists({
    _id: DOC_ID,
    _type: "locationPage",
    orderRank,
    city: { _type: "reference", _ref: FORT_WORTH_CITY_ID },
    title: "Fort Worth Federal Criminal Defense",
    navLabel: "Federal Criminal Defense",
    slug: { _type: "slug", current: "fort-worth-federal-criminal-defense-lawyers" },
    heroTitle: "Skilled Fort Worth Federal Criminal Defense Lawyers",
    lede: "Federal criminal charges carry consequences that can alter the course of your life. When federal agencies investigate you or prosecutors file charges against you, the power of the United States government stands behind every action.",
    body: toBlockContent({ intro: INTRO, sections: SECTIONS }, DOC_ID),
  });

  console.log(`Seeded "Fort Worth Federal Criminal Defense" into "${dataset}" (rank ${orderRank}).`);
  console.log("→ /fort-worth/fort-worth-federal-criminal-defense-lawyers/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
