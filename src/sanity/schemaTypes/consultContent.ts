import { defineType, defineField } from "sanity";

/**
 * The shape of the "Schedule Your Consultation" band. Defined once, used twice:
 *
 *  - `consult.content` — the shared default, shown on 13 pages
 *  - `<page>.consult`  — an optional per-page override
 *
 * Both sides share this type so an override can't drift out of shape (D13).
 *
 * The form's field labels, placeholders and button text stay in code — they're
 * UI, and changing them is a code change. `fineprint` and `thankYou` are here
 * because they're client-facing legal statements, not chrome.
 *
 * The photo is NOT here: it's art direction (D6) and pages that want a different
 * one pass it as a prop.
 */
export const consultContent = defineType({
  name: "consultContent",
  title: "Consult",
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
      description: 'The italic first line — e.g. "Schedule Your".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "Consultation.".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      description: "The paragraph above the form. This band styles paragraphs only.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "fineprint",
      title: "Fineprint",
      type: "string",
      description:
        "The small print under the form fields — e.g. the attorney-client privilege note.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "thankYou",
      title: "Thank-you message",
      type: "string",
      description: "Replaces the form once it's submitted.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong" },
    prepare({ lead, strong }) {
      return { title: [lead, strong].filter(Boolean).join(" "), subtitle: "Consult" };
    },
  },
});
