import { defineType, defineField } from "sanity";

/**
 * One card in the "Why Choose" carousel: icon + title + blurb.
 *
 * `icon` picks from a fixed set of Lucide paths held in WhyChoose.astro. The SVG
 * is presentation and stays in code — this is just the key. Keep this list in
 * sync with the `icons` map in that component.
 *
 * `body` is plain text, not blockContent: it's a one-line card blurb, and
 * headings or lists inside a card have no styling (same call as
 * practiceAreaCard.desc).
 */
export const WHY_CHOOSE_ICONS = [
  { title: "Trophy", value: "trophy" },
  { title: "Courthouse", value: "landmark" },
  { title: "Check", value: "check" },
  { title: "Shield", value: "shield" },
] as const;

export const whyChooseFeature = defineType({
  name: "whyChooseFeature",
  title: "Feature",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Drawn at the top of the card.",
      options: { list: WHY_CHOOSE_ICONS.map((c) => ({ ...c })) },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "icon" } },
});
