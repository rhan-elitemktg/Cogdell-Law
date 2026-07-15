import { defineType, defineField, defineArrayMember } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Home Page singleton. One object field per section of the page, so sections can
 * be added over time without reshaping the document.
 *
 * Section convention (D10) — applies to every page document:
 *   - each section is an `object` with `options: { collapsible: true, collapsed: true }`,
 *     so the page opens as a tidy list of closed accordions
 *   - sections carry NO `description` — the title says it; explain inside, on the
 *     individual fields, where it's actually needed
 *   - a list-only section still gets the object wrapper (see `sellingPoints`):
 *     `collapsible` is an ObjectOptions flag, and plain array fields cannot collapse
 *
 * Sections still hardcoded in their components are tracked in
 * docs/sanity-integration.md §3b.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: icons.home,
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description:
            "The small accented label above the headline. The rule before it is drawn automatically.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "titleAccent",
          title: "Headline — accent line",
          type: "string",
          description: "The first line. Rendered italic, in cream.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "titleSecond",
          title: "Headline — second line",
          type: "string",
          description: "The second line. Rendered in white.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "lead",
          title: "Lead paragraph",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "ctas",
          title: "Buttons",
          type: "array",
          of: [defineArrayMember({ type: "ctaButton" })],
          description:
            "Up to two. The first is the solid button, the second the outlined one — that's set by order, not by a field.",
          validation: (rule) => rule.max(2),
        }),
        defineField({
          name: "caption",
          title: "Caption bar",
          type: "object",
          description: "The attribution + video bar across the bottom of the hero.",
          options: { collapsible: true, collapsed: false },
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "role",
              title: "Role",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "watchLabel",
              title: "Video label",
              type: "string",
              description:
                'Names the video beside the play button, e.g. "The Firm Film". The word "Watch" above it is fixed.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "video",
              title: "Video",
              type: "reference",
              to: [{ type: "video" }],
              description: "Opens in the lightbox when the caption is clicked.",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "sellingPoints",
      title: "Selling Points",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "points",
          title: "Points",
          type: "array",
          of: [defineArrayMember({ type: "sellingPoint" })],
          description:
            "Exactly four — the bar divides into quarters on desktop and a 2×2 grid on smaller screens, and the dividers are drawn assuming four.",
          validation: (rule) =>
            rule
              .required()
              .length(4)
              .error("The stats bar is built for exactly four points."),
        }),
      ],
    }),
    defineField({
      name: "practiceAreas",
      title: "Practice Areas",
      type: "practiceAreasBand",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: { subtitle: "hero.eyebrow" },
    prepare({ subtitle }) {
      return { title: "Home Page", subtitle };
    },
  },
});
