import { defineType, defineField, defineArrayMember } from "sanity";

/** One school and its degrees/honors, for an attorney's Education block. */
export const educationEntry = defineType({
  name: "educationEntry",
  title: "School",
  type: "object",
  fields: [
    defineField({
      name: "school",
      title: "School",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: 'Optional — e.g. "Houston, Texas".',
    }),
    defineField({
      name: "lines",
      title: "Lines",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: 'One per line beneath the school — e.g. "J.D. — 1982".',
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "school", subtitle: "location" },
  },
});
