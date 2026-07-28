import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Videos Page singleton.
 *
 * Only the Consult override so far — the rest of the page is still hardcoded
 * (see docs/sanity-integration.md §3b). One collapsible object per section (D10).
 */
export const videosPage = defineType({
  name: "videosPage",
  title: "Videos Page",
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
      type: "pageHero",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "grid",
      title: "Video Grid",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingLead", title: "Heading — italic", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingStrong", title: "Heading — bold", type: "string", validation: (rule) => rule.required() }),
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
    prepare: () => ({ title: "Videos Page" }),
  },
});
