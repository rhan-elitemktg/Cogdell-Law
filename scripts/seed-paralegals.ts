/**
 * Adds the two paralegals to the team, and the /attorneys -> /our-team redirect.
 *
 *   npx sanity exec scripts/seed-paralegals.ts --with-user-token
 *
 * PLACEHOLDER CONTENT. Real names and bios weren't available when these went in,
 * so both documents carry obvious stand-ins. The photos ARE the real people —
 * deliberately not paired with invented names, which would misattribute a name
 * to a real face. Replace `name`, `slug` and `bio` in the Studio before launch.
 *
 * They use the `attorney` type because that's what the team grid, the nav
 * submenu and /attorney/{slug} all read — the type name is historical, the
 * Studio labels it "Team Member Bios". `role` is what distinguishes them.
 *
 * createIfNotExists, so re-running won't clobber real content typed over the
 * placeholders.
 */
import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import { basename } from "node:path";

const client = getCliClient();

const PHOTO_DIR = "/Users/rhanpemberton/Downloads/2026.06.23_Photos for Dan Steiner";

interface Seed {
  id: string;
  name: string;
  slug: string;
  role: string;
  credential: string;
  photo: string;
  photoAlt: string;
  phone: string;
  bio: string[];
}

const PARALEGALS: Seed[] = [
  {
    id: "paralegal-one",
    name: "Paralegal One",
    slug: "paralegal-one",
    role: "Paralegal",
    credential: "PLACEHOLDER — replace with real card blurb",
    photo: "DSC_6676a.jpg",
    photoAlt: "Portrait of a Cogdell Law Firm paralegal",
    phone: "713-426-2244",
    bio: [
      "PLACEHOLDER BIOGRAPHY — this copy is a stand-in and must be replaced before launch.",
      "Supports the firm's trial team through case preparation, discovery review and client communication, keeping matters organised from intake through resolution.",
    ],
  },
  {
    id: "paralegal-two",
    name: "Paralegal Two",
    slug: "paralegal-two",
    role: "Paralegal",
    credential: "PLACEHOLDER — replace with real card blurb",
    photo: "DSC_6826a.jpg",
    photoAlt: "Portrait of a Cogdell Law Firm paralegal",
    phone: "713-426-2244",
    bio: [
      "PLACEHOLDER BIOGRAPHY — this copy is a stand-in and must be replaced before launch.",
      "Works alongside the firm's attorneys on document management, exhibit preparation and scheduling, so clients always have a clear line into their case.",
    ],
  },
];

const toBlocks = (paragraphs: string[]) =>
  paragraphs.map((text, i) => ({
    _type: "block",
    _key: `bio${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `bio${i}s`, text, marks: [] }],
  }));

async function uploadPhoto(filename: string): Promise<string> {
  const path = `${PHOTO_DIR}/${filename}`;
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename: basename(path),
  });
  return asset._id;
}

// Rank them after everyone already on the page. lexorank sorts as plain strings,
// so a suffix past the existing ranks keeps them last without reordering anyone.
const lastRank = await client.fetch<string | null>(
  `*[_type == "attorney"] | order(orderRank desc)[0].orderRank`,
);

console.log(`Seeding into "${client.config().dataset}"…`);

for (const [i, p] of PARALEGALS.entries()) {
  const assetId = await uploadPhoto(p.photo);
  await client.createIfNotExists({
    _id: p.id,
    _type: "attorney",
    name: p.name,
    slug: { _type: "slug", current: p.slug },
    role: p.role,
    credential: p.credential,
    photo: { _type: "image", asset: { _type: "reference", _ref: assetId } },
    photoAlt: p.photoAlt,
    phone: p.phone,
    bio: toBlocks(p.bio),
    orderRank: `${lastRank ?? "0|100000:"}${String.fromCharCode(97 + i)}`,
  });
  // Fills the field on a document created by an earlier run, without touching
  // anything an editor has since typed over.
  await client.patch(p.id).setIfMissing({ phone: p.phone }).commit();
  console.log(`  ${p.name}  (${p.photo})`);
}

// /attorneys has no page behind it any more, so the old URL needs to land on the
// new one. Editor-managed redirects live in Sanity and ship on the next build.
await client.createIfNotExists({
  _id: "redirect-attorneys-our-team",
  _type: "redirect",
  source: "/attorneys",
  destination: "/our-team",
  permanent: true,
});
console.log("  redirect /attorneys -> /our-team");

console.log("done");
