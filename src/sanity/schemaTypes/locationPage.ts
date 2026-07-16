import { defineType, defineField, defineArrayMember } from "sanity";
import { icons } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/**
 * An "Areas We Serve" location page at /<citySlug>/<slug>. Same body model as a
 * practice area (D3) — intro + sections + FAQs — grouped under a serviceCity.
 */
export const locationPage = defineType({
  name: "locationPage",
  title: "Location Pages",
  type: "document",
  icon: icons.document,
  orderings: [orderRankOrdering],
  groups: [{ name: "main", title: "Content", default: true }, { name: "body", title: "Body" }],
  fields: [
    orderRankField({ type: "locationPage" }),
    defineField({ name: "city", title: "City", type: "reference", to: [{ type: "serviceCity" }], group: "main", validation: (rule) => rule.required() }),
    defineField({ name: "title", title: "Title", type: "string", group: "main", description: "<title> / meta label.", validation: (rule) => rule.required() }),
    defineField({ name: "navLabel", title: "Nav / breadcrumb label", type: "string", group: "main", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string", group: "main", validation: (rule) => rule.required() }),
    defineField({ name: "lede", title: "Lede", type: "text", rows: 3, group: "main" }),
    defineField({ name: "intro", title: "Intro", type: "blockContent", group: "body" }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "body",
      of: [defineArrayMember({
        type: "object", name: "section",
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "body", title: "Body", type: "blockContent", validation: (rule) => rule.required().min(1) }),
        ],
        preview: { select: { title: "heading" } },
      })],
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      group: "body",
      of: [defineArrayMember({
        type: "object", name: "practiceFaq",
        fields: [
          defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "answer", title: "Answer", type: "blockContent", validation: (rule) => rule.required().min(1) }),
        ],
        preview: { select: { title: "question" } },
      })],
    }),
  ],
  preview: {
    select: { title: "title", city: "city.city" },
    prepare({ title, city }) {
      return { title, subtitle: city ? `in ${city}` : undefined };
    },
  },
});
