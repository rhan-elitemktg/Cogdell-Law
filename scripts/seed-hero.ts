/**
 * Seeds the `video` documents and the Home Page hero with the content that was
 * hardcoded in Hero.astro / data/videos.ts.
 *
 * Run once, with your own Sanity login (no API token needed):
 *
 *   npx sanity exec scripts/seed-hero.ts --with-user-token
 *
 * Videos are matched on `wistiaId` and skipped if they already exist.
 *
 * ⚠️ This REPLACES `homePage.hero` wholesale. It was written to migrate an older
 * hero model (headlineItalic / lede / nameplate / mp4 film — see
 * docs/_backups/homePage.pre-migration.json) onto the current field names. Other
 * fields on the document, such as `sellingPoints`, are left untouched.
 *
 * Re-running will overwrite hero edits made in the Studio, so this is a one-shot
 * migration, not a routine sync.
 */
import { getCliClient } from "sanity/cli";
import { videos } from "../src/data/videos";

const client = getCliClient();

/** The video the hero's "Watch The Firm Film" button opens. */
const HERO_VIDEO_WISTIA_ID = "out2hqx46o";

async function seedVideos() {
  for (const v of videos) {
    // Look up by wistiaId rather than minting a slug-derived _id — document ids
    // are Sanity's to generate; source identity lives in a real field.
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "video" && wistiaId == $wistiaId][0]{_id}`,
      { wistiaId: v.id },
    );

    if (existing?._id) {
      console.log(`  = video exists, skipping: ${v.title}`);
      continue;
    }

    // Only the curated title + the id. `duration` and `poster` are deliberately
    // not stored — both are read from Wistia at build time (src/lib/wistia.ts).
    const created = await client.create({
      _type: "video",
      title: v.title,
      wistiaId: v.id,
    });
    console.log(`  + created video: ${v.title} (${created._id})`);
  }
}

async function seedHero() {
  const heroVideo = await client.fetch<{ _id: string } | null>(
    `*[_type == "video" && wistiaId == $wistiaId][0]{_id}`,
    { wistiaId: HERO_VIDEO_WISTIA_ID },
  );

  if (!heroVideo?._id) {
    throw new Error(
      `No video found with wistiaId "${HERO_VIDEO_WISTIA_ID}" — seed the videos first.`,
    );
  }

  // Singletons are the one place an explicit _id is correct.
  await client.createIfNotExists({ _id: "homePage", _type: "homePage" });

  // `set`, not `setIfMissing`: an older hero model already lives here and we're
  // deliberately replacing it. Only `hero` is touched — `sellingPoints` survives.
  await client
    .patch("homePage")
    .set({
      hero: {
        eyebrow: "Houston Trial Lawyers",
        titleAccent: "The Trial Lawyers",
        titleSecond: "Other Lawyers Call.",
        lead: "Complex civil disputes, personal injury, white collar defense, and high-stakes criminal cases in federal and state courts across the nation.",
        ctas: [
          {
            _key: "primary",
            _type: "ctaButton",
            label: "Schedule Consultation",
            href: "/contact",
          },
          {
            _key: "secondary",
            _type: "ctaButton",
            label: "Our Results",
            href: "/trial-experience",
          },
        ],
        caption: {
          name: "Dan Cogdell",
          role: "Founding Attorney",
          watchLabel: "The Firm Film",
          video: { _type: "reference", _ref: heroVideo._id },
        },
      },
    })
    .commit();

  console.log("  + homePage.hero written");
}

async function main() {
  console.log(`Seeding "${client.config().dataset}"…`);
  console.log("Videos:");
  await seedVideos();
  console.log("Hero:");
  await seedHero();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
