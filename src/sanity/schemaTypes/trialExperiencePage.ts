import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Trial Experience page singleton.
 *
 * Only the practice-areas band so far — the rest of /trial-experience is still
 * hardcoded (see docs/sanity-integration.md §3b). Same convention as homePage:
 * one collapsible object field per section (D10).
 */
export const trialExperiencePage = defineType({
  name: "trialExperiencePage",
  title: "Trial Experience Page",
  type: "document",
  icon: icons.case,
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "pageHero",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "trialResults",
      title: "Trial Results",
      type: "trialResultList",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "practiceAreas",
      title: "Practice Areas",
      type: "practiceAreasBand",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "ctaBar",
      title: "CTA Bar override",
      type: "ctaBarContent",
      description:
        "Optional. Leave empty to use the site-wide CTA Bar; fill this in only to give this page its own wording.",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Trial Experience Page" }),
  },
});
