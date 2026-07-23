import { defineType, defineField } from "sanity";

/**
 * The header of the full testimonials wall on /testimonials — eyebrow, heading
 * and a lede.
 *
 * Separate from `testimonialsBand` (the homepage's featured band) because it has
 * a lede and that one doesn't. The quotes are `testimonial` documents; the wall
 * shows all of them, in the Studio's drag-set order.
 */
export const testimonialsWallBand = defineType({
  name: "testimonialsWallBand",
  title: "Testimonials Wall",
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
      description: 'The italic first line — e.g. "In Their".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "Own Words.".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "blockContent",
      description:
        "The paragraph beside the heading. This band styles paragraphs only.",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong" },
    prepare({ lead, strong }) {
      return { title: [lead, strong].filter(Boolean).join(" "), subtitle: "Testimonials Wall" };
    },
  },
});
