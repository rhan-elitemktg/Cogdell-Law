import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * News Page singleton.
 *
 * Only the Consult override so far — the rest of the page is still hardcoded
 * (see docs/sanity-integration.md §3b). One collapsible object per section (D10).
 */
export const newsPage = defineType({
  name: "newsPage",
  title: "News Page",
  type: "document",
  icon: icons.documents,
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "pageHero",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "grid",
      title: "News Grid",
      type: "object",
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
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "News Page" }),
  },
});
