import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Attorneys page singleton (/attorneys).
 *
 * Only the attorney band's header so far — the cards come from `attorney`
 * documents, and the rest of the page (PageHero, Testimonials, WhyChoose) is
 * still hardcoded. Same convention as homePage: one collapsible object field per
 * section (D10).
 */
export const attorneysPage = defineType({
  name: "attorneysPage",
  title: "Attorneys Page",
  type: "document",
  icon: icons.users,
  fields: [
    defineField({
      name: "attorneys",
      title: "Attorneys",
      type: "attorneysBand",
      options: { collapsible: true, collapsed: true },
    }),
    // No `ctaBar` override here: /attorneys doesn't render the CTA bar.
  ],
  preview: {
    prepare: () => ({ title: "Attorneys Page" }),
  },
});
