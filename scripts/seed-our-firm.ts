/**
 * Seeds the Our Firm page copy (hero, intro, stats, quote, founding attorney,
 * origin story, values) from the hardcoded about/* components.
 *
 *   npx sanity exec scripts/seed-our-firm.ts --with-user-token
 *
 * Source: scripts/data/our-firm.seed.json — extracted from the components.
 * Body paragraphs keep their inline <em> as italic marks in blockContent.
 * Photos stay in code (D6). setIfMissing per field. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";
import seed from "./data/our-firm.seed.json";

const client = getCliClient();

/** Parse a paragraph's HTML (plain text + <em>…</em>) into a blockContent block. */
function paragraph(html: string, key: string) {
  const children: any[] = [];
  const re = /<em>(.*?)<\/em>|([^<]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(html))) {
    if (m[1] !== undefined) children.push({ _type: "span", _key: `${key}s${i}`, text: m[1], marks: ["em"] });
    else if (m[2]) children.push({ _type: "span", _key: `${key}s${i}`, text: m[2], marks: [] });
    i++;
  }
  return { _type: "block", _key: key, style: "normal", markDefs: [], children };
}

const body = (paras: string[], prefix: string) =>
  paras.map((p, i) => paragraph(p, `${prefix}${i}`));

async function main() {
  const d = seed as any;
  console.log(`Seeding Our Firm page into "${client.config().dataset}"…`);

  const doc = {
    hero: d.hero,
    intro: {
      eyebrow: d.intro.eyebrow,
      headingLead: d.intro.lead,
      headingStrong: d.intro.strong,
      body: body(d.intro.body, "oi-intro"),
    },
    stats: {
      items: d.stats.map((s: any, i: number) => ({ _key: `st${i}`, _type: "sellingPoint", value: s.value, label: s.label })),
    },
    quote: { lead: d.quote.lead, accent: d.quote.accent, attribution: d.quote.attribution },
    foundingAttorney: {
      eyebrow: d.foundingAttorney.eyebrow,
      headingLead: d.foundingAttorney.lead,
      headingStrong: d.foundingAttorney.strong,
      body: body(d.foundingAttorney.body, "oi-fa"),
    },
    originStory: {
      eyebrow: d.originStory.eyebrow,
      headingLead: d.originStory.lead,
      headingStrong: d.originStory.strong,
      body: body(d.originStory.body, "oi-os"),
      milestones: d.originStory.milestones.map((m: any, i: number) => ({ _key: `ms${i}`, _type: "milestone", key: m.key, title: m.title, desc: m.desc })),
    },
    values: {
      eyebrow: d.values.eyebrow,
      headingLead: d.values.lead,
      headingStrong: d.values.strong,
      items: d.values.items.map((v: any, i: number) => ({ _key: `vl${i}`, _type: "value", icon: v.icon, title: v.title, body: v.body })),
    },
  };

  await client.createIfNotExists({ _id: "ourFirmPage", _type: "ourFirmPage" });
  const patch = client.patch("ourFirmPage");
  for (const [k, v] of Object.entries(doc)) patch.setIfMissing({ [k]: v });
  await patch.commit();
  console.log("  ourFirmPage sections seeded");
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
