import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A client review dropped into a page body (D16) — paper card, name, stars, how
 * long ago, and the quote.
 *
 * The testimonial is a REFERENCE into the existing pool (Collections →
 * Testimonials), not retyped: the same review already feeds the homepage band
 * and the /testimonials wall, and three copies of one client's words would drift.
 * Editing it there updates every place it appears.
 *
 * Nothing to write here beyond the choice — the quote, the attribution and the
 * date all live on the testimonial itself. Set its "Date given" to get the
 * "3 months ago" line; leave that empty and the line is simply omitted.
 *
 * NOTE: `@sanity/icons` exposes no named exports — index into `icons`. Every
 * `pageBody` member needs its own icon; the Insert menu has nothing else to tell
 * them apart (F23).
 */
export const bodyTestimonial = defineType({
  name: "bodyTestimonial",
  title: "Client Testimonial",
  type: "object",
  icon: icons.star,
  fields: [
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "reference",
      to: [{ type: "testimonial" }],
      description:
        "Pick one from Collections → Testimonials. Its wording and date come from that record.",
      validation: (rule) => rule.required(),
    }),
  ],
  // Text-only, no `media` — same caution as bodyAttorney (see the note there).
  preview: {
    select: { author: "testimonial.author", quote: "testimonial.quote" },
    prepare({ author, quote }) {
      return {
        title: author || "Client Testimonial",
        subtitle: quote ? `Client Testimonial — “${quote}”` : "Client Testimonial",
      };
    },
  },
});
