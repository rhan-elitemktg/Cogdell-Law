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
  icon: icons.case,
  orderings: [orderRankOrdering],
  groups: [
    { name: "main", title: "Content", default: true },
    { name: "body", title: "Body" },
  ],
  fields: [
    orderRankField({ type: "practiceArea" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "main",
      description: "Short label — nav, breadcrumb, cards, <title>.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "main",
      description: "A SINGLE path segment (e.g. stark-law). The full URL is built from ancestors.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent area",
      type: "reference",
      to: [{ type: "practiceArea" }],
      group: "main",
      description: "Leave empty for a top-level area. Set it to nest this as a sub-topic.",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      group: "main",
      description: "The full descriptive H1 shown in the page hero.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "text",
      rows: 3,
      group: "main",
      description: "Opening line — leads the content body and the meta description.",
    }),
    defineField({
      name: "cardSummary",
      title: "Card summary",
      type: "text",
      rows: 2,
      group: "main",
      description: "Short blurb for the parent/index grid card.",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      group: "main",
      description: "Grid-card icon. Only top-level areas show one.",
      options: { list: PRACTICE_AREA_ICON_KEYS.map((k) => ({ title: k, value: k })) },
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "blockContent",
      group: "body",
      description: "Overview paragraphs under the hero, before the sections.",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "body",
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
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      group: "body",
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
  ],
  preview: {
    select: { title: "title", parent: "parent.title" },
    prepare({ title, parent }) {
      return { title, subtitle: parent ? `↳ under ${parent}` : "Top-level area" };
    },
  },
});
