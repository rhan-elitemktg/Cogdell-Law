/**
 * Seeds the Home Page "As seen in" press strip, uploading the 10 outlet logos.
 *
 *   npx sanity exec scripts/seed-press.ts --with-user-token
 *
 * Order matches the hardcoded array in Press.astro. Logos are matched on
 * originalFilename so re-running reuses the uploaded assets rather than
 * duplicating them.
 *
 * setIfMissing on the section, so it won't clobber Studio edits. Safe to re-run.
 */
import { getCliClient } from "sanity/cli";
import { createReadStream, existsSync } from "node:fs";
import { basename } from "node:path";

const client = getCliClient();

/** file → alt, in display order. */
const LOGOS: Array<{ file: string; alt: string }> = [
  { file: "cnn.png", alt: "CNN" },
  { file: "cbs.png", alt: "CBS" },
  { file: "fox-news.png", alt: "Fox News" },
  { file: "washington-post.png", alt: "The Washington Post" },
  { file: "houston-chronicle.png", alt: "Houston Chronicle" },
  { file: "dallas-morning-news.png", alt: "The Dallas Morning News" },
  { file: "la-times.png", alt: "Los Angeles Times" },
  { file: "texas-tribune.png", alt: "The Texas Tribune" },
  { file: "chicago-tribune.png", alt: "Chicago Tribune" },
  { file: "austin-american-statesman.png", alt: "Austin American-Statesman" },
];

const DIR = "src/assets/press";

async function uploadLogo(file: string) {
  const path = `${DIR}/${file}`;
  if (!existsSync(path)) throw new Error(`Logo not found: ${path}`);

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $file][0]{_id}`,
    { file },
  );
  if (existing?._id) return existing._id;

  const asset = await client.assets.upload("image", createReadStream(path), {
    filename: file,
  });
  return asset._id;
}

async function main() {
  console.log(`Seeding press strip into "${client.config().dataset}"…`);

  const logos = [];
  for (const { file, alt } of LOGOS) {
    const assetId = await uploadLogo(file);
    logos.push({
      _type: "pressLogo",
      _key: basename(file, ".png"),
      image: { _type: "image", asset: { _type: "reference", _ref: assetId } },
      alt,
    });
    console.log(`  ${alt}`);
  }

  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });
  await client.patch("homePage").setIfMissing({ press: { logos } }).commit();

  const n = await client.fetch<number>(`count(*[_id == "homePage"][0].press.logos)`);
  console.log(`homePage.press.logos: ${n}`);
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
