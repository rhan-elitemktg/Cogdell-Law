import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Videos Page singleton.
 *
 * Only the Consult override so far — the rest of the page is still hardcoded
 * (see docs/sanity-integration.md §3b). One collapsible object per section (D10).
 */
export const videosPage = defineType({
  name: "videosPage",
  title: "Videos Page",
  type: "document",
  icon: icons.play,
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
    prepare: () => ({ title: "Videos Page" }),
  },
});
