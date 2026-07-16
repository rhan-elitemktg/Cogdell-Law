import { defineType, defineField, defineArrayMember } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A legal page — Privacy Policy, Disclaimer. Title + a lead intro + optional
 * h2 sections. Same content shape as the practice-area body (D3).
 *
 * A singleton per page, pinned in the Studio by its fixed `_id` (privacy /
 * disclaimer), so there's exactly one of each.
 */
export const legalPage = defineType({
  name: "legalPage",
  title: "Legal Page",
  type: "document",
  icon: icons.document,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "blockContent",
      description: "The opening paragraphs, shown slightly larger.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "body", title: "Body", type: "blockContent", validation: (rule) => rule.required().min(1) }),
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title ?? "Legal Page" };
    },
  },
});
