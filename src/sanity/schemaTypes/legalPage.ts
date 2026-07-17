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
      name: "body",
      title: "Body Content",
      type: "blockContent",
      
      description:
        "The whole page body — paragraphs, headings, lists, links. Use Heading 2 for section titles.",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title ?? "Legal Page" };
    },
  },
});
