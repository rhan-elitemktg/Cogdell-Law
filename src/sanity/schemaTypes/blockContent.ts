import { defineType, defineArrayMember, defineField } from "sanity";

/**
 * The standard rich-text type. **Use this for every body-copy field** — practice
 * areas, location pages, news posts, legal pages, attorney bios — so the SEO team
 * gets the same toolbar everywhere.
 *
 * The one deliberate exception is `accentText` (the About pull quote), which is a
 * single decorative line where headings and lists would break the design.
 *
 * H1 is deliberately absent: every page's hero already renders the <h1>
 * (PageHero / Hero `titleLead` + `titleStrong`), so a body H1 would make a second
 * one on the page. Headings here start at H2. Don't add H1 back without moving
 * the hero's heading first.
 *
 * Lists and Quote aren't decoration either: the content in data/practice-areas.ts
 * uses `{ul}` and `{quote}` blocks, and can't migrate without them (D3).
 *
 * Renderers must emit the design's own classes. Note that every renderer is a
 * child component, so its scoped CSS needs `.parent :global(.child)` — see F14
 * and scripts/check-scoped-styles.py.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Content",
  type: "array",
  of: [
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
    }),
  ],
});
