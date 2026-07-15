import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/** Filter buckets on /trial-experience. Drives the filter row, not the badge. */
export const TRIAL_CATEGORIES = [
  { title: "Landmark Cases", value: "landmark" },
  { title: "Federal Victories", value: "federal" },
  { title: "Fraud & White Collar", value: "fraud" },
] as const;

/**
 * The badge printed on a card. Independent of `category` — several "fraud" cases
 * carry different badges ("White Collar", "Health Care Fraud", "Federal Fraud"),
 * so these are two separate fields, not one derived from the other.
 */
export const TRIAL_CATEGORY_LABELS = [
  { title: "Landmark Case", value: "Landmark Case" },
  { title: "Federal Victory", value: "Federal Victory" },
  { title: "White Collar", value: "White Collar" },
  { title: "Health Care Fraud", value: "Health Care Fraud" },
  { title: "Federal Fraud", value: "Federal Fraud" },
] as const;

/**
 * One case result. The single source of truth for a verdict, used in two places:
 *
 *  - /trial-experience — the full write-up (`name`, `outcome`, `note`)
 *  - the homepage About carousel — the short teaser (`teaser.*`), when the Home
 *    Page features this case
 *
 * The two were separate hardcoded arrays that had already drifted: the same case
 * was badged "Acquitted" on the homepage and "Dismissed" on /trial-experience.
 * Both were true (those cases had acquittals AND dismissals) — so the teaser
 * keeps its own wording rather than being forced to match, but both now sit in
 * one record where a real inconsistency is visible. See docs/sanity-integration.md F2.
 */
export const trialResult = defineType({
  name: "trialResult",
  title: "Trial Results",
  type: "document",
  icon: icons.case,
  fields: [
    defineField({
      name: "name",
      title: "Case name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "outcome",
      title: "Outcome",
      type: "string",
      description: 'The verdict badge — e.g. "Acquitted", "Dismissed", "Mistrial".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "note",
      title: "Write-up",
      type: "text",
      rows: 5,
      description: "The full account, shown on Trial Experience.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Filter group",
      type: "string",
      description: "Which filter button on Trial Experience reveals this case.",
      options: { list: TRIAL_CATEGORIES.map((c) => ({ ...c })) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categoryLabel",
      title: "Badge",
      type: "string",
      description:
        "The label printed on the card. Independent of the filter group — a fraud case may be badged White Collar, Health Care Fraud or Federal Fraud.",
      options: { list: TRIAL_CATEGORY_LABELS.map((c) => ({ ...c })) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teaser",
      title: "Homepage teaser",
      type: "object",
      description:
        "Short version for the homepage carousel. Only used when the Home Page features this case; leave empty otherwise.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", title: "Short name", type: "string" }),
        defineField({ name: "outcome", title: "Short outcome", type: "string" }),
        defineField({ name: "note", title: "Short note", type: "text", rows: 3 }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", outcome: "outcome", subtitle: "categoryLabel" },
    prepare({ title, outcome, subtitle }) {
      return { title, subtitle: [outcome, subtitle].filter(Boolean).join(" · ") };
    },
  },
});
