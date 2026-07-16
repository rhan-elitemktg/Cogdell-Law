import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/**
 * A frequently-asked question. A growing, curated list the firm reorders in the
 * Studio (D2) — same shape as testimonials/attorneys.
 *
 * Shown on the homepage today; a document type (not a homePage array) because
 * it's real content the firm maintains, and drag-to-order needs documents.
 *
 * NOTE: the per-practice-area FAQs (data/practice-areas.ts) are a SEPARATE,
 * embedded concern that migrates with `practiceArea` in Phase 5 — these are the
 * firm's general questions, not tied to any one area.
 *
 * The answer is `blockContent` (D12) so the SEO team can bold, link and list.
 */
export const faq = defineType({
  name: "faq",
  title: "FAQs",
  type: "document",
  icon: icons["help-circle"],
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "faq" }),
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "blockContent",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "question" },
  },
});
