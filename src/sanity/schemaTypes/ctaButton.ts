import { defineType, defineField } from "sanity";

/**
 * A call-to-action button: label + destination only.
 *
 * The visual treatment (solid / outlined) is deliberately NOT editable — it's
 * decided by position in code, so the design can't drift. The trailing arrow is
 * part of every button and also lives in code.
 */
export const ctaButton = defineType({
  name: "ctaButton",
  title: "Button",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .max(30)
          .warning("Button labels read best kept under ~30 characters."),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "url",
      description: 'An internal path (e.g. "/contact") or a full external URL.',
      validation: (rule) =>
        rule
          .required()
          .uri({
            allowRelative: true,
            scheme: ["http", "https", "mailto", "tel"],
          }),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
