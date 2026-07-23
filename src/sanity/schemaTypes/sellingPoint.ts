import { defineType, defineField } from "sanity";

/**
 * One stat in the selling-points bar: a big value over a small label.
 * e.g. "40+" / "Years of Trial Experience".
 */
export const sellingPoint = defineType({
  name: "sellingPoint",
  title: "Selling Point",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      description: 'The large line — e.g. "40+", "Nationwide", "Elite".',
      validation: (rule) =>
        rule
          .required()
          .max(24)
          .warning("The large stat line is built to be short — keep it under ~24 characters."),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        'The small line beneath — e.g. "Years of Trial Experience". Rendered in caps.',
      validation: (rule) =>
        rule
          .required()
          .max(48)
          .warning("The caption reads best kept under ~48 characters."),
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});
