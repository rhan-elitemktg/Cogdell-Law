import { defineType, defineField } from "sanity";

/** One label/value pair in the "Where We Practice" stats list. */
export const practiceReachStat = defineType({
  name: "practiceReachStat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'The small caption — e.g. "Principal Office".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      description: 'The line beneath — e.g. "Houston, Texas".',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "value", subtitle: "label" } },
});
