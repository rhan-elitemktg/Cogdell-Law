import { defineType, defineField, defineArrayMember } from "sanity";
import { icons } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { PRACTICE_AREA_ICON_KEYS } from "../../lib/practiceAreaIcons";

/**
 * A practice area. Flat documents with a self-referencing `parent` (D1): the tree
 * is rebuilt at query time by walking parents, so arbitrary depth works and every
 * sub-topic is independently editable. Slug is a single path segment; the full
 * URL path is /practice-areas/<ancestors…>/<slug>.
 *
 * Body content is blockContent (D3). Internal links in the body are plain
 * relative-path URLs for now; the internal/external reference toggle (D4) is a
 * later refinement.
 */
export const practiceArea = defineType({
  name: "practiceArea",
  title: "Practice Areas",
  type: "document",
  icon: icons.tag,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "practiceArea" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Short label — nav, breadcrumb, cards, <title>.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "A SINGLE path segment (e.g. stark-law). The full URL is built from ancestors.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent area",
      type: "reference",
      to: [{ type: "practiceArea" }],
      description: "Leave empty for a top-level area. Set it to nest this as a sub-topic.",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      description: "The full descriptive H1 shown in the page hero.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "text",
      rows: 3,
      description: "Opening line — leads the content body and the meta description.",
    }),
    defineField({
      name: "cardSummary",
      title: "Card summary",
      type: "text",
      rows: 2,
      description: "Short blurb for the parent/index grid card.",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Grid-card icon. Only top-level areas show one.",
      options: { list: PRACTICE_AREA_ICON_KEYS.map((k) => ({ title: k, value: k })) },
    }),
            defineField({
      name: "body",
      title: "Body Content",
      type: "blockContent",
      description:
        "The whole page body — paragraphs, headings, lists, links. Use Heading 2 for section titles.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "practiceFaq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", title: "Answer", type: "blockContent", validation: (rule) => rule.required().min(1) }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: { title: "title", parent: "parent.title" },
    prepare({ title, parent }) {
      return { title, subtitle: parent ? `↳ under ${parent}` : "Top-level area" };
    },
  },
});
