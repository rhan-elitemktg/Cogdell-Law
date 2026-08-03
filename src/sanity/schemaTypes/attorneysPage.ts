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
  // Document id stays `attorneysPage`; only the label and the route moved.
  title: "Team Members Page",
  type: "document",
  icon: icons.users,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "pageHero",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "attorneys",
      title: "Attorneys",
      type: "attorneysBand",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "testimonialsBand",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "whyChoose",
      title: "Why Choose",
      type: "whyChooseBand",
      group: "content",
      options: { collapsible: true, collapsed: true },
    }),
    // No `ctaBar` override here: /attorneys doesn't render the CTA bar.
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Attorneys Page" }),
  },
});
