/**
 * Hyperlinks bare phone numbers and contact CTAs in practice-area and location
 * page bodies.
 *
 *   npx sanity exec scripts/link-contact-ctas.ts --with-user-token          # dry run
 *   APPLY=1 npx sanity exec scripts/link-contact-ctas.ts --with-user-token  # write
 *
 * Targets are listed explicitly rather than matched by regex. A sweep would
 * catch headings ("When Should I Reach Out to an Attorney?") and generic prose
 * ("turn to Cogdell Law Firm"), neither of which should become a link, and it
 * would double-link sentences that already carry a /contact link in a sibling
 * span — which most of the location-page CTAs do.
 *
 * Hrefs follow what the existing content already uses: `tel:+17134262244` and
 * `/contact` (no trailing slash — `trailingSlash: false` in vercel.json).
 *
 * Idempotent: a span already carrying a link mark is skipped, so a re-run is a
 * no-op. Patches only the blocks named below, by _key.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const TEL = "tel:+17134262244";
const CONTACT = "/contact";

interface Target {
  slug: string;
  block: string;
  /** Exact substrings to link, in the order they appear. */
  anchors: { text: string; href: string }[];
}

const TARGETS: Target[] = [
  // ---- Practice areas: the two block-quotes ----
  {
    slug: "health-care-fraud-defense",
    block: "healthcarefrauddefense-introb1",
    anchors: [
      { text: "713-426-2244", href: TEL },
      { text: "send a message", href: CONTACT },
    ],
  },
  {
    slug: "billing-fraud-defense",
    block: "healthcarefrauddefensebillingfrauddefens-introb1",
    anchors: [
      { text: "713-426-2244", href: TEL },
      { text: "reach out to us online", href: CONTACT },
    ],
  },

  // ---- Location pages: block-quotes (nothing linked in these yet) ----
  {
    slug: "dallas-health-care-fraud-defense-lawyer",
    block: "dallashealthcarefrauddefenselawyer-introb1",
    anchors: [
      { text: "713-426-2244", href: TEL },
      // "Contact us today at ..." opens the same sentence; linking both would
      // put two /contact links in one line, so the closing CTA carries it.
      { text: "send a message online", href: CONTACT },
    ],
  },
  {
    slug: "fort-worth-health-care-fraud-defense-lawyer",
    block: "fortworthhealthcarefrauddefenselawyer-introb1",
    anchors: [
      { text: "713-426-2244", href: TEL },
      { text: "contact form", href: CONTACT },
    ],
  },

  // ---- Location pages: body prose ----
  // Most already link a CTA phrase in a sibling span; only the phone is bare.
  {
    slug: "beaumont-federal-criminal-defense-attorney",
    block: "beaumontfederalcriminaldefenseattorney-s3b0",
    anchors: [{ text: "713-426-2244", href: TEL }],
  },
  {
    slug: "dallas-federal-criminal-defense-lawyers",
    block: "dallasfederalcriminaldefenselawyers-s3b0",
    anchors: [{ text: "713-426-2244", href: TEL }],
  },
  {
    slug: "dallas-health-care-fraud-defense-lawyer",
    block: "dallashealthcarefrauddefenselawyer-s2b0",
    anchors: [{ text: "713-426-2244", href: TEL }],
  },
  {
    slug: "houston-healthcare-fraud-defense-law-office",
    block: "houstonhealthcarefrauddefenselawoffice-s3b0",
    anchors: [{ text: "713-426-2244", href: TEL }],
  },
  {
    slug: "sherman-federal-criminal-defense-lawyers",
    block: "shermanfederalcriminaldefenselawyers-s4b1",
    anchors: [{ text: "713-426-2244", href: TEL }],
  },
  // These two link nothing today, so both halves of the CTA need one.
  {
    slug: "fort-worth-health-care-fraud-defense-lawyer",
    block: "fortworthhealthcarefrauddefenselawyer-s4b0",
    anchors: [
      { text: "713-426-2244", href: TEL },
      { text: "send an email", href: CONTACT },
    ],
  },
  {
    slug: "fort-worth-federal-criminal-defense-lawyers",
    block: "location-fort-worth-federal-criminal-defense-s2-b0",
    anchors: [
      { text: "Contact us online", href: CONTACT },
      { text: "713-426-2244", href: TEL },
    ],
  },
];

interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}
interface MarkDef {
  _type: string;
  _key: string;
  href?: string;
}
interface Block {
  _type: string;
  _key: string;
  style?: string;
  markDefs?: MarkDef[];
  children?: Span[];
}

/**
 * Splits whichever span holds `anchor` into up to three, giving the middle one
 * a fresh link mark. Returns false when the anchor isn't found unlinked — an
 * already-linked or missing anchor is a no-op, not an error.
 */
function linkAnchor(block: Block, anchor: string, href: string): boolean {
  const linkKeys = new Set(
    (block.markDefs ?? []).filter((m) => m._type === "link").map((m) => m._key),
  );
  const spans = block.children ?? [];

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    if (span._type !== "span") continue;
    if ((span.marks ?? []).some((m) => linkKeys.has(m))) continue; // already a link
    const at = span.text.indexOf(anchor);
    if (at === -1) continue;

    const markKey = `${span._key}-lnk${linkKeys.size + 1}`;
    const before = span.text.slice(0, at);
    const after = span.text.slice(at + anchor.length);
    const marks = span.marks ?? [];

    const replacement: Span[] = [];
    if (before)
      replacement.push({ _type: "span", _key: `${span._key}-a`, text: before, marks });
    replacement.push({
      _type: "span",
      _key: `${span._key}-b`,
      text: anchor,
      marks: [...marks, markKey],
    });
    if (after)
      replacement.push({ _type: "span", _key: `${span._key}-c`, text: after, marks });

    block.children = [...spans.slice(0, i), ...replacement, ...spans.slice(i + 1)];
    block.markDefs = [...(block.markDefs ?? []), { _type: "link", _key: markKey, href }];
    return true;
  }
  return false;
}

const apply = process.env.APPLY === "1";
console.log(apply ? "APPLYING\n" : "DRY RUN — set APPLY=1 to write\n");

const tx = client.transaction();
let patched = 0;
let skipped = 0;

for (const target of TARGETS) {
  const doc = await client.fetch<{ _id: string; body: Block[] } | null>(
    `*[_type in ["practiceArea","locationPage"] && slug.current == $slug][0]{_id, body}`,
    { slug: target.slug },
  );
  if (!doc) {
    console.log(`!! no document for /${target.slug}`);
    continue;
  }
  const block = (doc.body ?? []).find((b) => b._key === target.block);
  if (!block) {
    console.log(`!! /${target.slug}: no block ${target.block}`);
    continue;
  }

  const applied: string[] = [];
  for (const { text, href } of target.anchors) {
    if (linkAnchor(block, text, href)) applied.push(`${text} -> ${href}`);
    else skipped++;
  }

  console.log(`/${target.slug}  [${block.style ?? "normal"}]`);
  if (!applied.length) {
    console.log("    (nothing to do — already linked)\n");
    continue;
  }
  for (const a of applied) console.log(`    + ${a}`);
  console.log(
    "    = " +
      (block.children ?? [])
        .map((s) => {
          const isLink = (s.marks ?? []).some((m) =>
            (block.markDefs ?? []).some((d) => d._key === m && d._type === "link"),
          );
          return isLink ? `[${s.text}]` : s.text;
        })
        .join("") +
      "\n",
  );

  tx.patch(doc._id, (p) =>
    p.set({
      [`body[_key=="${target.block}"].children`]: block.children,
      [`body[_key=="${target.block}"].markDefs`]: block.markDefs,
    }),
  );
  patched++;
}

console.log(`blocks to patch: ${patched}   anchors skipped (already linked/absent): ${skipped}`);

if (apply && patched) {
  await tx.commit();
  console.log("committed");
} else if (!apply) {
  console.log("nothing written");
}
