import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * The header of the FAQ section — eyebrow, heading and lede. The questions
 * themselves are `faq` documents; this is only the band's own copy.
 *
 * A reusable section object (D11). Homepage-only today, but shaped like the other
 * bands so it can appear elsewhere without change.
 */
export const faqBand = defineType({
  name: "faqBand",
  title: "FAQ",
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
      description: 'The italic first line — e.g. "Answers to the Questions".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "That Matter Most.".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "blockContent",
      description: "The paragraph under the heading. This band styles paragraphs only.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "questions",
      title: "Questions",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })],
      description:
        "Which FAQs appear here, in this order. Add or remove them without touching the master FAQ list.",
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong" },
    prepare({ lead, strong }) {
      return { title: [lead, strong].filter(Boolean).join(" "), subtitle: "FAQ" };
    },
  },
});
