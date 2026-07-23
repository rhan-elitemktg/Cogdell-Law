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
      validation: (rule) =>
        rule
          .required()
          .max(48)
          .warning("The caption reads best kept under ~48 characters."),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      description: 'The line beneath — e.g. "Houston, Texas".',
      validation: (rule) =>
        rule
          .required()
          .max(24)
          .warning("The large stat line is built to be short — keep it under ~24 characters."),
    }),
  ],
  preview: { select: { title: "value", subtitle: "label" } },
});
