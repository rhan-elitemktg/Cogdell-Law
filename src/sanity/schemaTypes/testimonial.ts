import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/** How many testimonials the homepage band can show — the grid is three across. */
export const MAX_FEATURED = 3;

/**
 * A client testimonial. One pool, used in two places:
 *
 *  - /testimonials — the full wall, in the Studio's drag-set order
 *  - the homepage / /attorneys band — the ones toggled `featured` (max 3)
 *
 * There used to be two sets: 16 real quotes in data/testimonials.ts and 3 on the
 * homepage attributed to "Former Client" with a practice-area tag, with **zero
 * overlap** — the homepage three looked like design-phase placeholder copy. The
 * firm chose to feature real testimonials instead; the placeholders are gone.
 * See docs/sanity-integration.md F19.
 */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  icon: icons["double-quote"],
  // Drag-to-reorder (D2) — sets the order of the wall on /testimonials.
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "testimonial" }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 6,
      description:
        "The client's words. The homepage card suits shorter quotes — the wall handles any length.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Attribution",
      type: "string",
      description:
        'As it should appear — initials, "Former Client", or a description. The dash before it is drawn automatically.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tag",
      title: "Tag",
      type: "string",
      description:
        'Optional. Shown only on the homepage card — e.g. "Federal Criminal Defense". Left empty, the card simply omits it.',
    }),
    defineField({
      name: "featured",
      title: "Feature on the homepage",
      type: "boolean",
      initialValue: false,
      description: `Shows this in the homepage and /attorneys band. Up to ${MAX_FEATURED} — the grid is three across.`,
      validation: (rule) =>
        rule.custom(async (featured, context) => {
          if (!featured) return true;

          const client = context.getClient({ apiVersion: "2025-08-15" });
          const id = context.document?._id?.replace(/^drafts\./, "");

          // Count the OTHER featured testimonials; drafts and published are the
          // same document, so exclude both forms of this one.
          const others = await client.fetch<number>(
            `count(*[_type == "testimonial" && featured == true && !(_id in [$id, $draftId])])`,
            { id, draftId: `drafts.${id}` },
          );

          return (
            others < MAX_FEATURED ||
            `Only ${MAX_FEATURED} testimonials can be featured — unfeature another first.`
          );
        }),
    }),
  ],
  preview: {
    select: { quote: "quote", author: "author", featured: "featured", tag: "tag" },
    prepare({ quote, author, featured, tag }) {
      return {
        title: quote?.slice(0, 60) + (quote?.length > 60 ? "…" : ""),
        subtitle: [featured ? "★ Featured" : null, author, tag].filter(Boolean).join(" · "),
      };
    },
  },
});
