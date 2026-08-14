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
    defineField({
      name: "practiceAreaLinks",
      title: "Extra practice areas in the menu",
      type: "array",
      of: [{ type: "reference", to: [{ type: "practiceArea" }] }],
      description:
        "Fleshes out this city's submenu under Areas We Frequently Serve. These link to the firm-wide practice area page, not a city-specific one — use them for services this city has no page of its own for. Its real location pages are listed first automatically; anything here that duplicates one is skipped.",
    }),
  ],
  preview: { select: { title: "city", subtitle: "citySlug.current" } },
});
