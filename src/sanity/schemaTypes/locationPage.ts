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
  icon: icons.marker,
  orderings: [orderRankOrdering],
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    orderRankField({ type: "locationPage" }),
    defineField({ name: "city", title: "City", type: "reference", to: [{ type: "serviceCity" }], group: "content", validation: (rule) => rule.required() }),
    defineField({ name: "title", title: "Title", type: "string", description: "<title> / meta label.", group: "content", validation: (rule) => rule.required() }),
    defineField({ name: "navLabel", title: "Nav / breadcrumb label", type: "string", description: "The short name shown in the nav menu and breadcrumb — often just the city, where Title is the longer page/meta name.", group: "content", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      description:
        "Optional. Leave empty and the page uses the default firm photo. The hotspot sets what stays in frame when the photo is cropped to the hero.",
      options: { hotspot: true },
      group: "content",
    }),
    defineField({ name: "lede", title: "Lede", type: "text", rows: 3, group: "content" }),
    defineField({
      name: "body",
      title: "Body Content",
      type: "blockContent",
      description:
        "The whole page body — paragraphs, headings, lists, links. Use Heading 2 for section titles.",
      group: "content",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      group: "content",
      of: [defineArrayMember({
        type: "object", name: "practiceFaq",
        fields: [
          defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "answer", title: "Answer", type: "blockContent", validation: (rule) => rule.required().min(1) }),
        ],
        preview: { select: { title: "question" } },
      })],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", city: "city.city" },
    prepare({ title, city }) {
      return { title, subtitle: city ? `in ${city}` : undefined };
    },
  },
});
