import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/**
 * A city the firm serves — a grouping label for its location pages. The pages
 * reference their city; the city itself has no page (it's a breadcrumb/nav
 * label). See [[locationPage]].
 */
export const serviceCity = defineType({
  name: "serviceCity",
  title: "Service Cities",
  type: "document",
  icon: icons.pin,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "serviceCity" }),
    defineField({ name: "city", title: "City", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "citySlug",
      title: "City slug",
      type: "slug",
      description: "URL segment — /<citySlug>/<page>.",
      options: { source: "city", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "city", subtitle: "citySlug.current" } },
});
