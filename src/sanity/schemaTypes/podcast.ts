import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";
import { PODCAST_TAGS } from "../../lib/podcastTags";
import { badChapterLines, parseChapters } from "../../lib/podcastChapters";

/**
 * A podcast episode — "The Cogdell Counsel". The single source of truth for an
 * episode, shown on /podcast (the filterable index grid) and /podcast/<slug>
 * (the full episode page).
 *
 * The card + episode-page artwork is a code-rendered brand lockup over
 * `coverImage` (see PodcastArtwork.astro) with the episode number printed on it,
 * so editors only upload a background photo and set the number.
 *
 * Audio comes from Spotify: paste the episode's Spotify link into `spotifyUrl`
 * and the page embeds Spotify's player (which pulls the audio + controls).
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
      description: 'No need to add "| Ep. N" — that\'s added automatically from the number below.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "episodeNumber",
      title: "Episode number",
      type: "number",
      group: "content",
      description: 'Printed on the artwork ("EPISODE 12") and after the title ("| Ep. 12").',
      validation: (rule) => rule.required().integer().positive(),
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
      name: "tag",
      title: "Tag",
      type: "string",
      group: "content",
      description: "The category badge on the card, and the filter button that reveals it on /podcast.",
      options: { list: PODCAST_TAGS.map((t) => ({ ...t })) },
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
        'The photo behind the "Cogdell Counsel" lockup on the card + episode page. Optional — leave empty to use the firm default; upload one to override it.',
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      group: "content",
      rows: 3,
      description: "A short blurb — used for search/social metadata when no SEO description is set.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Episode content",
      type: "blockContent",
      group: "content",
      description: "The show notes / write-up shown on the episode page.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "spotifyUrl",
      title: "Spotify episode link",
      type: "url",
      group: "content",
      description:
        "Paste the episode's Spotify URL (e.g. https://open.spotify.com/episode/…). The page embeds Spotify's player from this.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "chapters",
      title: "Chapters",
      type: "text",
      group: "content",
      rows: 8,
      description:
        'One chapter per line — timestamp, then title: "02:14 Meeting Dick DeGuerin". Shown under the player, and clicking one jumps the episode to that point. Paste the same block into Buzzsprout so Spotify shows the same chapters.',
      validation: (rule) => [
        // An error, not a warning: a line we can't read is silently missing from
        // the page, and the editor would never find out.
        rule.custom((value?: string) => {
          const bad = badChapterLines(value);
          if (bad.length === 0) return true;
          return `Start every line with a timestamp, e.g. "02:14 Meeting Dick DeGuerin". Check ${
            bad.length === 1 ? `line ${bad[0]}` : `lines ${bad.join(", ")}`
          }.`;
        }),
        rule
          .custom((value?: string) => {
            const chapters = parseChapters(value);
            const backwards = chapters.some((c, i) => i > 0 && c.seconds <= chapters[i - 1].seconds);
            return backwards ? "Timestamps aren't in order — chapters are listed exactly as typed." : true;
          })
          .warning(),
      ],
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
    select: { title: "title", episodeNumber: "episodeNumber", tag: "tag" },
    prepare({ title, episodeNumber, tag }) {
      return {
        title: episodeNumber ? `${title} | Ep. ${episodeNumber}` : title,
        subtitle: tag,
      };
    },
  },
});
