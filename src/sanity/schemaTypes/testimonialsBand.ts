import { defineType, defineField } from "sanity";

/**
 * The header of the featured-testimonials band — eyebrow and heading only.
 *
 * The quotes themselves are NOT here: they're `testimonial` documents toggled
 * `featured`, so a quote is edited once and appears wherever it's shown. This
 * type is only the band's own copy.
 *
 * A reusable section object, not a document: the band appears on the Home Page
 * and /attorneys, and each page holds its own copy so they can be worded
 * differently (D11).
 */
export const testimonialsBand = defineType({
  name: "testimonialsBand",
  title: "Testimonials",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      validation: (rule) =>
        rule.required().max(40).warning("Eyebrows read best kept under ~40 characters."),
    }),
    defineField({
      name: "headingLead",
      title: "Heading — italic",
      type: "string",
      description: 'The italic first line — e.g. "What Clients Are".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "Saying About Us.".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong" },
    prepare({ lead, strong }) {
      return {
        title: [lead, strong].filter(Boolean).join(" "),
        subtitle: "Quotes come from featured Testimonials",
      };
    },
  },
});
