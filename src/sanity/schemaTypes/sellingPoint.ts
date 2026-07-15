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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        'The small line beneath — e.g. "Years of Trial Experience". Rendered in caps.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});
