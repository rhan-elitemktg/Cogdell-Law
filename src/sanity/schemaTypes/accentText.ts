import { defineType, defineArrayMember } from "sanity";

/**
 * A short run of rich text whose only formatting is the brand "accent"
 * highlight — no headings, lists, links or bold.
 *
 * ⚠️ The **deliberate exception** to the `blockContent` standard (D12), and the
 * only one. Body copy uses `blockContent` so the SEO team gets H1–H4 / links /
 * bold everywhere. This field is a single decorative line in the About band,
 * where a heading or bullet list has no styling and would break the design.
 *
 * Don't reach for this type for anything new — if a field is prose, it's
 * `blockContent`.
 */
export const accentText = defineType({
  name: "accentText",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      // One paragraph style, nothing else — this is a pull quote, not an article.
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: {
        decorators: [{ title: "Accent", value: "accent" }],
        annotations: [],
      },
    }),
  ],
});
