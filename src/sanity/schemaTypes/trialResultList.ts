import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * The ordered set of cases a page shows. Only the selection and its order live
 * here — the case content itself is on the `trialResult` documents.
 *
 * Order comes from this array rather than a rank on the documents, which keeps
 * curation per-page (D11) and means a new case is an explicit choice to feature,
 * not an automatic appearance.
 */
export const trialResultList = defineType({
  name: "trialResultList",
  title: "Trial Results",
  type: "object",
  fields: [
    defineField({
      name: "cases",
      title: "Cases",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "trialResult" }] })],
      description:
        "Shown in this order. Filter buttons and the disclaimer are part of the page design and stay in code.",
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: { cases: "cases" },
    prepare({ cases }) {
      return { title: "Trial Results", subtitle: `${cases?.length ?? 0} cases` };
    },
  },
});
