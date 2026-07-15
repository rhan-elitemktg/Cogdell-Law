import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * CTA Bar singleton — the site-wide default, shown on ~43 pages: every homepage
 * band, /videos, /trial-experience, /testimonials, /news and /news/*,
 * /practice-areas and /practice-areas/*, and every /{city}/* location page.
 *
 * Edit here and it changes everywhere. A page that wants its own wording sets
 * its optional `ctaBar` override instead; the frontend coalesces override over
 * default (D13).
 *
 * Note most of those routes are dynamic (`practice-areas/[...slug]`,
 * `[city]/[slug]`, `news/[slug]`) and have no page document at all — which is
 * why this can't be per-page content the way the practice-areas band is (D11).
 */
export const ctaBar = defineType({
  name: "ctaBar",
  title: "CTA Bar",
  type: "document",
  icon: icons.bell,
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "ctaBarContent",
      description:
        "The default shown on every page. Individual pages can override it.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { lead: "content.headingLead", rest: "content.headingRest" },
    prepare({ lead, rest }) {
      return {
        title: "CTA Bar",
        subtitle: [lead, rest].filter(Boolean).join(" ") || "Site-wide default",
      };
    },
  },
});
