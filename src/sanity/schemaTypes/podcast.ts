import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A podcast episode — "The Cogdell Law Uncensored". The single source of truth
 * for an episode, shown on /podcast (the searchable index grid) and
 * /podcast/<slug> (the full episode page).
 *
 * The card artwork is a code-rendered brand lockup over `coverImage` (see
 * PodcastArtwork.astro), so editors only upload a background photo. On the
 * episode page the artwork carries the title and a play button instead, and
 * swaps itself for the YouTube player when clicked (YouTubeArtwork.astro).
 *
 * The video comes from YouTube: paste the 11-character id from the watch URL
 * into `youtubeId`. Nothing else about the video is stored here — runtime,
 * thumbnail and the player itself are YouTube's to own (D8).
 *
 * NOTE (do not reintroduce): no field `groups`/tabs, and the Studio list preview
 * stays text-only with a single ordering — selecting `coverImage` in the preview
 * crashed the Podcast Episodes list (Studio LoadingPane + React 19 ref loop).
 */
export const podcast = defineType({
  name: "podcast",
  title: "Podcast",
  type: "document",
  icon: icons.microphone,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Episode title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube video ID",
      type: "string",
      group: "content",
      description:
        'The 11-character id from the video\'s URL — in "youtube.com/watch?v=0srbD2hn2vM" that is 0srbD2hn2vM. This is what loads the player; without it the episode page shows artwork with no play button.',
      validation: (rule) => [
        rule
          .required()
          .regex(/^[A-Za-z0-9_-]{11}$/, {
            name: "YouTube video ID",
            invert: false,
          }),
        // Two episodes pointing at one video would build two pages of the same
        // thing, and nothing else would complain. Worth the async check: ids are
        // pasted by hand, and a mis-paste is the likeliest way it happens.
        rule.custom(async (value, context) => {
          if (!value) return true;
          const { getClient } = context;
          const client = getClient({ apiVersion: "2025-08-15" });
          const id = context.document?._id.replace(/^drafts\./, "");
          const taken = await client.fetch(
            `count(*[_type == "podcast" && youtubeId == $value && !(_id in [$id, "drafts." + $id])]) > 0`,
            { value, id },
          );
          return taken ? "Another episode already uses this YouTube video." : true;
        }),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "URL segment — /podcast/<slug>.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "content",
      description:
        'Leave empty to use the date this episode was added. Set it to override — this is what "newest" sorts by.',
    }),
    defineField({
      name: "coverImage",
      title: "Artwork background photo",
      type: "image",
      group: "content",
      options: { hotspot: true },
      description:
        'The photo behind the "Cogdell Law Uncensored" lockup on the card, and behind the title on the episode page. Optional — leave empty to use the firm default; upload one to override it.',
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      group: "content",
      rows: 3,
      description:
        "A short blurb for search results and social shares. Leave blank and the episode title is used instead.",
    }),
    defineField({
      name: "body",
      title: "Episode content",
      type: "blockContent",
      group: "content",
      description: "Show notes shown under the video. Optional — leave blank and nothing renders.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "newest",
      by: [
        { field: "publishedAt", direction: "desc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    // Text-only list preview — no image select (see NOTE above). Rows show the
    // document icon.
    select: { title: "title", subtitle: "youtubeId" },
  },
});
