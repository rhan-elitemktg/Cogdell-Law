import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A news item — the firm's press coverage and owned articles.
 *
 * Hybrid, kept from the static model: an item either links OUT to external
 * coverage (`linkType: "external"`), or is a full article hosted on the site
 * (`linkType: "article"`, with a `body`) that generates /news/[slug].
 *
 * "Newest" sorts by `coalesce(publishedAt, _createdAt)` — the date defaults to
 * when the item was added and `publishedAt` overrides it (the firm's request).
 *
 * The homepage picks ONE featured item via a reference on the News band; the
 * right column shows the 3 newest excluding it (F20).
 */
export const newsItem = defineType({
  name: "newsItem",
  title: "News",
  type: "document",
  icon: icons["document-text"],
  groups: [{ name: "content", title: "Content", default: true }, { name: "meta", title: "Meta" }],
  fields: [
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description:
        "URL segment for owned articles (/news/<slug>). Needed even for external items — it's the stable key.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "outlet",
      title: "Outlet",
      type: "string",
      group: "content",
      description: 'Who published it — e.g. "Texas Tribune", "KHOU".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "outletLogo",
      title: "Outlet logo",
      type: "image",
      group: "content",
      description: "Optional. A text badge of the outlet name is shown when empty.",
    }),
    defineField({
      name: "media",
      title: "Media type",
      type: "string",
      group: "content",
      description: "Drives the label and default action verb (Read / Watch / Listen).",
      options: {
        list: [
          { title: "Article", value: "article" },
          { title: "Video", value: "video" },
          { title: "Podcast", value: "podcast" },
        ],
        layout: "radio",
      },
      initialValue: "article",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "content",
      description: "Firm-authored blurb shown on the cards.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "meta",
      description:
        "Leave empty to use the date this item was added. Set it to override — this is what \"newest\" sorts by.",
    }),
    defineField({
      name: "linkType",
      title: "This item",
      type: "string",
      group: "content",
      description:
        "Whether the card links out to external coverage, or opens a full article hosted here.",
      options: {
        list: [
          { title: "Links to external coverage", value: "external" },
          { title: "Full article on our site", value: "article" },
        ],
        layout: "radio",
      },
      initialValue: "external",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      group: "content",
      hidden: ({ parent }) => parent?.linkType !== "external",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string };
          if (parent?.linkType === "external" && !value) return "An external item needs a URL.";
          return true;
        }),
    }),
    defineField({
      name: "ctaLabel",
      title: "Button label",
      type: "string",
      group: "content",
      description: 'Optional action override — e.g. "Watch on YouTube". Defaults to Read / Watch / Listen.',
    }),
    defineField({
      name: "body",
      title: "Article body",
      type: "blockContent",
      group: "content",
      hidden: ({ parent }) => parent?.linkType !== "article",
      description: "The full article, shown at /news/<slug>.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string };
          if (parent?.linkType === "article" && (!value || (value as unknown[]).length === 0))
            return "An owned article needs a body.";
          return true;
        }),
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "newest",
      by: [{ field: "publishedAt", direction: "desc" }, { field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", outlet: "outlet", media: "media", link: "linkType" },
    prepare({ title, outlet, media, link }) {
      return {
        title,
        subtitle: [outlet, media, link === "article" ? "owned" : "external"].filter(Boolean).join(" · "),
      };
    },
  },
});
