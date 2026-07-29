import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Fact-Checked Banner singleton — the site-wide default, shown at the foot of
 * every practice area and location page.
 *
 * Edit here and it changes on all of them. A page that needs its own wording
 * fills in its own Fact-Checked Banner → Statement instead, and a page that
 * shouldn't show one at all turns its toggle off. The frontend coalesces
 * override over default (D13).
 *
 * The banner is a trust signal on pages Google reads closely, so it is ON by
 * default — including on the pages that already existed when it was added, which
 * carry no toggle value at all. The renderer treats anything but an explicit
 * `false` as on.
 */
export const factCheck = defineType({
  name: "factCheck",
  title: "Fact-Checked Banner",
  type: "document",
  icon: icons["checkmark-circle"],
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "factCheckContent",
      description:
        "The default shown on every practice area and location page. Individual pages can override it.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { label: "content.label" },
    prepare({ label }) {
      return {
        title: "Fact-Checked Banner",
        subtitle: label ? `${label} — site-wide default` : "Site-wide default",
      };
    },
  },
});
