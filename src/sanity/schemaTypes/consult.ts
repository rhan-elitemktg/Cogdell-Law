import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Consult singleton — the site-wide default for the consultation band, shown on
 * 13 pages: the homepage, /attorneys, /our-firm, /contact, /videos,
 * /trial-experience, /testimonials, /news and /news/*, /practice-areas and
 * /practice-areas/*, /attorney/* and every /{city}/* page.
 *
 * Edit here and it changes everywhere. A page that wants its own wording sets its
 * optional `consult` override; the frontend coalesces override over default (D13).
 *
 * Most of those routes are dynamic and have no page document at all, which is why
 * this can't be per-page content the way the practice-areas band is (D11).
 */
export const consult = defineType({
  name: "consult",
  title: "Consult",
  type: "document",
  icon: icons.envelope,
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "consultContent",
      description: "The default shown on every page. Individual pages can override it.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { lead: "content.headingLead", strong: "content.headingStrong" },
    prepare({ lead, strong }) {
      return {
        title: "Consult",
        subtitle: [lead, strong].filter(Boolean).join(" ") || "Site-wide default",
      };
    },
  },
});
