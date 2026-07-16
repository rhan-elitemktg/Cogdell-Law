import { defineType, defineField } from "sanity";

/**
 * One card in the "What We Try" band: icon + title + blurb.
 *
 * NOTE: these cards are marketing copy and are deliberately NOT linked to the
 * /practice-areas tree — they describe what the firm does, and the two lists
 * don't match (see docs/sanity-integration.md F2). If cards ever become links,
 * revisit that first.
 *
 * `icon` picks from a fixed set of Lucide paths held in PracticeAreas.astro.
 * The SVG itself is presentation and stays in code — this is just the key.
 * Keep this list in sync with the `icons` map in that component.
 */
export const ICON_CHOICES = [
  { title: "Briefcase", value: "briefcase" },
  { title: "People", value: "users" },
  { title: "Layers", value: "layers" },
  { title: "Courthouse", value: "columns" },
  { title: "Magnifier", value: "search" },
  { title: "Document", value: "doc" },
] as const;

export const practiceAreaCard = defineType({
  name: "practiceAreaCard",
  title: "Practice Area Card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "desc",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Drawn in the firm's accent colour at the top of the card.",
      options: {
        list: ICON_CHOICES.map((c) => ({ title: c.title, value: c.value })),
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "icon" },
  },
});
