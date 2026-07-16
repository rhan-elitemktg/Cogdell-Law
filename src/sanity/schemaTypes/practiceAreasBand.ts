import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * The "What We Try" band — an icon-card grid describing the firm's work.
 *
 * A reusable section object, not a document: it appears on the Home Page, Trial
 * Experience and Testimonials, and each page holds its own copy so they can be
 * worded differently. Shared schema, separate content.
 */
export const practiceAreasBand = defineType({
  name: "practiceAreasBand",
  title: "Practice Areas Band",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small accented label above the heading.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingLead",
      title: "Heading — lead",
      type: "string",
      description: 'First part of the heading, in lighter weight — e.g. "What We".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — emphasis",
      type: "string",
      description: 'The bold tail of the heading — e.g. "Try.". A space is added before it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "blockContent",
      description:
        "The copy beside the heading. This band styles paragraphs only — headings and lists aren't styled here.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [defineArrayMember({ type: "practiceAreaCard" })],
      description:
        "The grid is 3 across on desktop and 2 on tablet, so the count must be a multiple of six — otherwise the final row leaves a visible gap.",
      validation: (rule) =>
        rule.required().custom((cards) => {
          const n = cards?.length ?? 0;
          if (n === 0) return "Add six cards.";
          if (n % 6 !== 0) {
            return `The grid is 3 across (2 on tablet), so it needs a multiple of six — 6 or 12, not ${n}. Any other count leaves a gap in the last row.`;
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong", cards: "cards" },
    prepare({ lead, strong, cards }) {
      return {
        title: [lead, strong].filter(Boolean).join(" "),
        subtitle: `${cards?.length ?? 0} cards`,
      };
    },
  },
});
