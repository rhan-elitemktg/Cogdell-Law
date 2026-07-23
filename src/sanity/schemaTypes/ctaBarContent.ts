import { defineType, defineField } from "sanity";

/**
 * The shape of the site-wide CTA band. Defined once and used in two places:
 *
 *  - `ctaBar.content` — the shared default, shown on ~43 pages
 *  - `<page>.ctaBar`  — an optional per-page override
 *
 * Both sides share this type, so an override can't drift out of shape from the
 * default. See D13.
 */
export const ctaBarContent = defineType({
  name: "ctaBarContent",
  title: "CTA Bar",
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
      description: 'The italic opening word — e.g. "Call".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "headingRest",
      title: "Heading — rest",
      type: "string",
      description: 'The rest of the heading — e.g. "Cogdell Law Firm.".',
      validation: (rule) =>
        rule.required().max(60).warning("Heading lines read best kept short (~60 characters)."),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      description:
        "This band styles paragraphs only — headings and lists aren't styled here.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "cta",
      title: "Button",
      type: "ctaButton",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { lead: "headingLead", rest: "headingRest" },
    prepare({ lead, rest }) {
      return {
        title: [lead, rest].filter(Boolean).join(" "),
        subtitle: "CTA Bar",
      };
    },
  },
});
