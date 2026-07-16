import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Our Firm Page singleton.
 *
 * Only the Consult override so far — the rest of the page is still hardcoded
 * (see docs/sanity-integration.md §3b). Same convention as homePage: one
 * collapsible object field per section (D10).
 */
export const ourFirmPage = defineType({
  name: "ourFirmPage",
  title: "Our Firm Page",
  type: "document",
  icon: icons.users,
  fields: [
    defineField({
      name: "consult",
      title: "Consult override",
      type: "consultContent",
      description:
        "Optional. Leave empty to use the site-wide Consult; fill this in only to give this page its own wording.",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Our Firm Page" }),
  },
});
