import { defineType, defineField } from "sanity";

/**
 * The header of the attorney card band — eyebrow, heading and lede.
 *
 * The cards themselves are NOT here: they're `attorney` documents, so a person's
 * name, role and photo are edited once and appear wherever they're shown. This
 * type is only the band's own copy.
 *
 * A reusable section object, not a document: the band appears on the Home Page
 * and /attorneys, and each page holds its own copy so they can be worded
 * differently (D11).
 */
export const attorneysBand = defineType({
  name: "attorneysBand",
  title: "Attorneys",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingLead",
      title: "Heading — italic",
      type: "string",
      description: 'The italic first line — e.g. "Trial Lawyers".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "Who Fight to Win.".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "blockContent",
      description:
        "The paragraph beside the heading. This band styles paragraphs only — headings and lists aren't styled here.",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong" },
    prepare({ lead, strong }) {
      return {
        title: [lead, strong].filter(Boolean).join(" "),
        subtitle: "Attorneys Band — cards come from Attorneys documents",
      };
    },
  },
});
