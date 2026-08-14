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
        "The services shown under this city in the Areas We Frequently Serve menu, in the order they appear. List every service you want, not just the ones lacking a page: where this city has its own location page for a service, the menu links to that page instead of the firm-wide one. Keep the list the same across cities and they all read in the same order. A location page you forget to list still gets a link, at the end.",
    }),
  ],
  preview: { select: { title: "city", subtitle: "citySlug.current" } },
});
