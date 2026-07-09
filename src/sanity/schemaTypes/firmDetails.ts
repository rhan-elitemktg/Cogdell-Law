import { defineType, defineField } from "sanity";

export const firmDetails = defineType({
  name: "firmDetails",
  title: "Firm Details",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Firm Name",
      type: "string",
      initialValue: "Cogdell Law",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Main contact number, e.g. 713-426-2244",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description:
        "Site logo. Upload the light/white version — it sits on the navy header.",
      options: { hotspot: false },
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Firm Details", subtitle: title };
    },
  },
});
