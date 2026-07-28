import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Practice Areas Page singleton.
 *
 * Only the Consult override so far — the rest of the page is still hardcoded
 * (see docs/sanity-integration.md §3b). One collapsible object per section (D10).
 */
export const practiceAreasPage = defineType({
  name: "practiceAreasPage",
  title: "Practice Areas Page",
  type: "document",
  icon: icons["th-large"],
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "pageHero",
      options: { collapsible: true, collapsed: true },
      group: "content",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Practice Areas Page" }),
  },
});
