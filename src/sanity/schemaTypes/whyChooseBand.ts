import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * The "Why Choose" band — a centred header over a full-bleed photo, with a
 * horizontal carousel of feature cards.
 *
 * A reusable section object, not a document: the band appears on the Home Page
 * and /attorneys, and each page holds its own copy so they can be worded
 * differently (D11).
 *
 * The cards are a carousel (`overflow-x: auto`), so any number scrolls — there's
 * no layout constraint on the count, unlike the practice-areas grid.
 */
export const whyChooseBand = defineType({
  name: "whyChooseBand",
  title: "Why Choose",
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
      description: 'The italic first line — e.g. "Why Choose".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "Cogdell Law Firm.".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "features",
      title: "Cards",
      type: "array",
      of: [defineArrayMember({ type: "whyChooseFeature" })],
      description: "Shown in this order. The row scrolls, so any number fits.",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong", features: "features" },
    prepare({ lead, strong, features }) {
      return {
        title: [lead, strong].filter(Boolean).join(" "),
        subtitle: `${features?.length ?? 0} cards`,
      };
    },
  },
});
