/**
 * Seeds the 4 `attorney` documents, uploading their headshots to Sanity.
 *
 *   npx sanity exec scripts/seed-attorneys.ts --with-user-token
 *
 * Source: scripts/data/attorneys.seed.json — a snapshot merged from
 * data/attorneys.ts (the full records) and the card array in Attorneys.astro
 * (the `credential` blurb, which existed only there).
 *
 * `role` comes from data/attorneys.ts on purpose. The cards disagreed with the
 * bio pages for two attorneys — "Founding Attorney" vs "Principal & Founder",
 * and "Attorney" vs "Of Counsel" — so the site contradicted itself about a formal
 * designation. The bio page's wording wins (F15), which changes those two cards.
 *
 * `bio` becomes blockContent (D12); each paragraph is one `normal` block.
 *
 * Matched on slug, so re-running updates rather than duplicating. Photos are
 * uploaded once and reused on re-runs.
 */
import { getCliClient } from "sanity/cli";
import { createReadStream, existsSync } from "node:fs";
import { basename } from "node:path";
import seed from "./data/attorneys.seed.json";

const client = getCliClient();

interface SeedAttorney {
  slug: string;
  name: string;
  role: string;
  credential: string;
  photo: string;
  photoAlt: string;
  phone: string;
  email?: string;
  practiceTags: string[];
  bio?: string[];
  education: { school: string; location?: string; lines: string[] }[];
  classesSeminars?: string[];
  publishedWorks?: string[];
  barAdmissions: string[];
  associations?: string[];
  honors: string[];
  pastPositions?: string[];
  representativeCases?: string[];
}

const attorneys = seed as SeedAttorney[];

const key = (p: string, i: number) => `${p}${i}`;

const toBlocks = (paras?: string[]) =>
  paras?.length
    ? paras.map((text, i) => ({
        _type: "block",
        _key: key("p", i),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: key("s", i), text, marks: [] }],
      }))
    : undefined;

const withKeys = <T extends object>(items: T[] | undefined, p: string) =>
  items?.length ? items.map((item, i) => ({ ...item, _key: key(p, i) })) : undefined;

/** Upload the headshot once; reuse the asset if it's already there. */
async function uploadPhoto(path: string) {
  if (!existsSync(path)) throw new Error(`Photo not found: ${path}`);
  const filename = basename(path);

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename },
  );
  if (existing?._id) return existing._id;

  const asset = await client.assets.upload("image", createReadStream(path), { filename });
  return asset._id;
}

/** Drop undefined keys so we never write empty optional fields. */
const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

async function main() {
  console.log(`Seeding attorneys into "${client.config().dataset}"…`);

  for (const a of attorneys) {
    const assetId = await uploadPhoto(a.photo);

    const doc = compact({
      _type: "attorney",
      name: a.name,
      slug: { _type: "slug", current: a.slug },
      role: a.role,
      credential: a.credential,
      photo: { _type: "image", asset: { _type: "reference", _ref: assetId } },
      photoAlt: a.photoAlt,
      phone: a.phone,
      email: a.email,
      practiceTags: a.practiceTags,
      bio: toBlocks(a.bio),
      education: withKeys(a.education, "edu"),
      barAdmissions: a.barAdmissions,
      honors: a.honors,
      classesSeminars: a.classesSeminars,
      publishedWorks: a.publishedWorks,
      associations: a.associations,
      pastPositions: a.pastPositions,
      representativeCases: a.representativeCases,
    });

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "attorney" && slug.current == $slug][0]{_id}`,
      { slug: a.slug },
    );

    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
      console.log(`  = updated: ${a.name} (${a.role})`);
    } else {
      await client.create(doc);
      console.log(`  + created: ${a.name} (${a.role})`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
