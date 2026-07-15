import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Trial Experience page singleton.
 *
 * Only the practice-areas band so far — the rest of /trial-experience is still
 * hardcoded (see docs/sanity-integration.md §3b). Same convention as homePage:
 * one collapsible object field per section (D10).
 */
export const trialExperiencePage = defineType({
  name: "trialExperiencePage",
  title: "Trial Experience Page",
  type: "document",
  icon: icons.case,
  fields: [
    defineField({
      name: "practiceAreas",
      title: "Practice Areas",
      type: "practiceAreasBand",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Trial Experience Page" }),
  },
});
