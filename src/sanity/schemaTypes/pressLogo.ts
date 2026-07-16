import { defineType, defineField } from "sanity";

/**
 * One outlet logo in the homepage "As seen in" press strip.
 *
 * `object-fit: contain` at a fixed height, so no cropping — the image needs no
 * hotspot. `alt` is the outlet name; the duplicated marquee copy is aria-hidden,
 * so alt is only spoken once.
 */
export const pressLogo = defineType({
  name: "pressLogo",
  title: "Press Logo",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Logo",
      type: "image",
      description:
        "The outlet's logo, ideally a transparent PNG. It's shown at a fixed height, so any width works.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Outlet name",
      type: "string",
      description: 'For screen readers — e.g. "The Washington Post".',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "alt", media: "image" } },
});
