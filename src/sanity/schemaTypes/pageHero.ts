import { defineType, defineField } from "sanity";

/**
 * A page hero's editable copy — eyebrow, two-part title, lede. The hero image and
 * the CTA buttons stay in code (art direction + fixed actions). Shared by the
 * interior page singletons (F16).
 */
export const pageHero = defineType({
  name: "pageHero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleLead", title: "Title — lead", type: "string" }),
    defineField({ name: "titleStrong", title: "Title — emphasis", type: "string", validation: (r) => r.required() }),
    defineField({ name: "lede", title: "Lede", type: "text", rows: 3 }),
  ],
  preview: {
    select: { lead: "titleLead", strong: "titleStrong" },
    prepare({ lead, strong }) {
      return { title: [lead, strong].filter(Boolean).join(" "), subtitle: "Hero" };
    },
  },
});
