import { defineType, defineArrayMember, defineField } from "sanity";

/**
 * THE text toolbar, as a fresh array member each call.
 *
 * `blockContent` and `pageBody` (D16) both build their text member from this, so
 * the two can't drift: add a style or a mark here and it appears in both. That's
 * the point — D12's rule is one text toolbar everywhere.
 *
 * Why a factory and not a shared const: `@sanity/schema` memoizes compiled array
 * members in a Map keyed by the definition object's *identity*, so a single
 * shared literal would hand both arrays one shared compiled instance. Harmless
 * today, but it couples two schema types through an undocumented internal. A
 * fresh object costs nothing.
 *
 * H1 is deliberately absent: every page's hero already renders the <h1>
 * (PageHero / Hero `titleLead` + `titleStrong`), so a body H1 would make a second
 * one on the page. Headings here start at H2. Don't add H1 back without moving
 * the hero's heading first.
 *
 * Lists and Quote aren't decoration either: the content in data/practice-areas.ts
 * uses `{ul}` and `{quote}` blocks, and can't migrate without them (D3).
 *
 * Deliberately no `of:` — that slot is Sanity's INLINE-object list. The body
 * blocks in `pageBody` are block-level only, and omitting `of` here is what
 * guarantees an editor can't drop a navy banner mid-sentence (D16).
 */
export const bodyBlockMember = () =>
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      // No H1 — the page hero owns it. See the note above.
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
      { title: "Heading 4", value: "h4" },
      { title: "Quote", value: "blockquote" },
    ],
    lists: [
      { title: "Bulleted", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      // Toggles — no data of their own.
      decorators: [
        { title: "Bold", value: "strong" },
        { title: "Italic", value: "em" },
      ],
      // Marks that carry data.
      annotations: [
        defineArrayMember({
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            defineField({
              name: "href",
              title: "URL",
              type: "url",
              description:
                'An internal path ("/contact") or a full external address.',
              validation: (rule) =>
                rule.required().uri({
                  allowRelative: true,
                  scheme: ["http", "https", "mailto", "tel"],
                }),
            }),
          ],
        }),
      ],
    },
  });

/**
 * The standard rich-text type. **Use this for every body-copy field** — news
 * posts, legal pages, attorney bios, FAQ answers, band copy — so the SEO team
 * gets the same toolbar everywhere.
 *
 * Text only: this array holds nothing but blocks. The two long-form page types
 * that own a full content column (practice areas, location pages) use `pageBody`
 * instead, which is this toolbar plus insertable layout blocks (D16). Everything
 * else stays here, and that containment is deliberate — a CTA banner has no
 * business inside an FAQ answer.
 *
 * The one deliberate exception to the toolbar is `accentText` (the About pull
 * quote), a single decorative line where headings and lists would break the design.
 *
 * Renderers must emit the design's own classes. Note that every renderer is a
 * child component, so its scoped CSS needs `.parent :global(.child)` — see F14
 * and scripts/check-scoped-styles.py.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Content",
  type: "array",
  of: [bodyBlockMember()],
});
