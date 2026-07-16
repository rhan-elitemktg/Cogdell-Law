import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * The homepage "In the News" band header + featured pick.
 *
 * Layout (F20): the chosen `featured` article shows on the left; the right column
 * shows the 3 newest news items EXCLUDING the featured one. The rest of the news
 * library lives as `newsItem` documents.
 */
export const newsBand = defineType({
  name: "newsBand",
  title: "News",
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
      description: 'The italic first line — e.g. "In the".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingStrong",
      title: "Heading — bold",
      type: "string",
      description: 'The bold second line — e.g. "News.".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "blockContent",
      description: "The paragraph under the heading. This band styles paragraphs only.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "featured",
      title: "Featured article",
      type: "reference",
      to: [{ type: "newsItem" }],
      description:
        "Shown large on the left. It's excluded from the 3-newest list on the right, so it never appears twice.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { lead: "headingLead", strong: "headingStrong", featured: "featured.title" },
    prepare({ lead, strong, featured }) {
      return {
        title: [lead, strong].filter(Boolean).join(" "),
        subtitle: featured ? `Featured: ${featured}` : "News",
      };
    },
  },
});
