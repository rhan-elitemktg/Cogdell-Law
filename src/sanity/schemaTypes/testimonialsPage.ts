import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Testimonials page singleton.
 *
 * Only the practice-areas band so far — the testimonial quotes themselves are
 * still hardcoded in data/testimonials.ts and become their own document type in
 * Phase 1. Same convention as homePage: one collapsible object per section (D10).
 */
export const testimonialsPage = defineType({
  name: "testimonialsPage",
  title: "Testimonials Page",
  type: "document",
  icon: icons.blockquote,
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
      name: "testimonialsWall",
      title: "Testimonials Wall",
      type: "testimonialsWallBand",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "practiceAreas",
      title: "Practice Areas",
      type: "practiceAreasBand",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "ctaBar",
      title: "CTA Bar override",
      type: "ctaBarContent",
      group: "content",
      description:
        "Optional. Leave empty to use the site-wide CTA Bar; fill this in only to give this page its own wording.",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Testimonials Page" }),
  },
});
