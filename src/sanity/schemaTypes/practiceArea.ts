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
 *
 * Tabs (field groups): **Card** is how the area appears on someone else's page
 * (the grid cell that links here), **Page** is the page itself, **SEO** is the
 * search listing. Card is the default tab because Title drives everything else.
 * Sanity always prepends its own "All fields" tab ahead of these.
 */
export const practiceArea = defineType({
  name: "practiceArea",
  title: "Practice Areas",
  type: "document",
  icon: icons.tag,
  orderings: [orderRankOrdering],
  groups: [
    { name: "card", title: "Card", default: true },
    { name: "page", title: "Page" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    orderRankField({ type: "practiceArea" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Short label — nav, breadcrumb, cards, <title>.",
      group: "card",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "A SINGLE path segment (e.g. stark-law). The full URL is built from ancestors.",
      options: { source: "title", maxLength: 96 },
      group: "page",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent Page",
      type: "reference",
      to: [{ type: "practiceArea" }],
      description: "Leave empty for a top-level area. Set it to nest this as a sub-topic.",
      group: "page",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      description: "The full descriptive H1 shown in the page hero.",
      group: "page",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      description:
        "Optional. Leave empty and the page uses the default firm photo. The hotspot sets what stays in frame when the photo is cropped to the hero.",
      options: { hotspot: true },
      group: "page",
    }),
    defineField({
      name: "cardSummary",
      title: "Card summary",
      type: "text",
      rows: 2,
      description:
        "Short blurb for the parent/index grid card. Also the search-result summary, unless SEO → Meta description is filled in.",
      group: "card",
      validation: (rule) =>
        rule.max(160).warning("Over ~160 characters gets truncated in search results."),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Grid-card icon. Only top-level areas show one.",
      options: { list: PRACTICE_AREA_ICON_KEYS.map((k) => ({ title: k, value: k })) },
      group: "card",
    }),
    defineField({
      name: "body",
      title: "Body Content",
      // `pageBody`, not `blockContent`: same text toolbar, plus the layout blocks
      // an editor can drop between paragraphs (D16).
      type: "pageBody",
      description:
        "The whole page body, opening paragraph included — paragraphs, headings, lists, links. Use Heading 2 for section titles, and the Insert button to drop a CTA banner between sections.",
      group: "page",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      group: "page",
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
    // On its own tab the collapsible wrapper is just an extra click — the tab
    // already does the hiding.
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", parent: "parent.title" },
    prepare({ title, parent }) {
      return { title, subtitle: parent ? `↳ under ${parent}` : "Top-level area" };
    },
  },
});
