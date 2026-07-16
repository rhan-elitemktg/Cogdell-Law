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
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "pageHero",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "testimonialsWall",
      title: "Testimonials Wall",
      type: "testimonialsWallBand",
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
      name: "consult",
      title: "Consult override",
      type: "consultContent",
      description:
        "Optional. Leave empty to use the site-wide Consult; fill this in only to give this page its own wording.",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Testimonials Page" }),
  },
});
