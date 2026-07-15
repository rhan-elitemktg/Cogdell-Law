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
      name: "practiceAreas",
      title: "Practice Areas",
      type: "practiceAreasBand",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Testimonials Page" }),
  },
});
