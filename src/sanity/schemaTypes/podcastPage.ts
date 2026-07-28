import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Podcast Page singleton — the editable copy for the /podcast index hero.
 *
 * The hero is a bespoke, centered, full-bleed design (see PodcastHero.astro), so
 * it does NOT reuse the shared `pageHero` object (which is a left-aligned photo +
 * scrim). Only copy lives here; the background image is a code asset (D6).
 */
export const podcastPage = defineType({
  name: "podcastPage",
  title: "Podcast Page",
  type: "document",
  icon: icons.play,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      options: { collapsible: true, collapsed: true },
      group: "content",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "text",
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Podcast Page" }),
  },
});
