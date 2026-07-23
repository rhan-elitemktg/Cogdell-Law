import { defineType, defineField, defineArrayMember } from "sanity";
import { icons } from "@sanity/icons";

/** Icon keys for the Values cards — SVG lives in code (Values.astro). */
const VALUE_ICONS = [
  { title: "Sparkles", value: "sparkles" },
  { title: "Gavel", value: "gavel" },
  { title: "People", value: "users" },
];

/**
 * Our Firm Page singleton. One collapsible object per section (D10), in the same
 * order the page renders. Art-directed photos stay in code (D6); this holds the
 * editable copy.
 */
export const ourFirmPage = defineType({
  name: "ourFirmPage",
  title: "Our Firm Page",
  type: "document",
  icon: icons.users,
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "titleLead", title: "Title — lead", type: "string", validation: (r) => r.required() }),
        defineField({ name: "titleStrong", title: "Title — emphasis", type: "string", validation: (r) => r.required() }),
        defineField({ name: "lede", title: "Lede", type: "text", rows: 3, validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingLead", title: "Heading — lead", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingStrong", title: "Heading — emphasis", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", title: "Body", type: "blockContent", validation: (r) => r.required().min(1) }),
      ],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          of: [defineArrayMember({ type: "sellingPoint" })],
          description: "The stats bar. Exactly four (built for a 4-up / 2×2 layout).",
          validation: (r) => r.required().length(4),
        }),
      ],
    }),
    defineField({
      name: "quote",
      title: "Quote Band",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "lead", title: "Quote — lead", type: "string", description: "First line, before the accent.", validation: (r) => r.required() }),
        defineField({ name: "accent", title: "Quote — accent", type: "string", description: "The highlighted phrase on the second line.", validation: (r) => r.required() }),
        defineField({ name: "attribution", title: "Attribution", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "foundingAttorney",
      title: "Founding Attorney",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingLead", title: "Heading — lead", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingStrong", title: "Heading — emphasis", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", title: "Body", type: "blockContent", validation: (r) => r.required().min(1) }),
      ],
    }),
    defineField({
      name: "originStory",
      title: "Origin Story",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingLead", title: "Heading — lead", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingStrong", title: "Heading — emphasis", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", title: "Body", type: "blockContent", validation: (r) => r.required().min(1) }),
        defineField({
          name: "milestones",
          title: "Milestones",
          type: "array",
          of: [defineArrayMember({
            type: "object", name: "milestone",
            fields: [
              defineField({ name: "key", title: "Marker", type: "string", description: 'e.g. "1970s", "Age 25".', validation: (r) => r.required() }),
              defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
              defineField({ name: "desc", title: "Description", type: "text", rows: 2, validation: (r) => r.required() }),
            ],
            preview: { select: { title: "title", subtitle: "key" } },
          })],
          validation: (r) => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingLead", title: "Heading — lead", type: "string", validation: (r) => r.required() }),
        defineField({ name: "headingStrong", title: "Heading — emphasis", type: "string", validation: (r) => r.required() }),
        defineField({
          name: "items",
          title: "Cards",
          type: "array",
          of: [defineArrayMember({
            type: "object", name: "value",
            fields: [
              defineField({ name: "icon", title: "Icon", type: "string", options: { list: VALUE_ICONS }, validation: (r) => r.required() }),
              defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
              defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (r) => r.required() }),
            ],
            preview: { select: { title: "title", subtitle: "icon" } },
          })],
          validation: (r) => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Our Firm Page" }),
  },
});
