import { defineType, defineField } from "sanity";

/**
 * The shape of the fact-checked banner. Defined once and used in two places:
 *
 *  - `factCheck.content`  — the shared default, shown on every practice area
 *                           and location page
 *  - `<page>.factCheck.content` — an optional per-page override
 *
 * Both sides share this type, so an override can't drift out of shape from the
 * default. Same arrangement as `ctaBarContent` (D13).
 */
export const factCheckContent = defineType({
  name: "factCheckContent",
  title: "Fact-Checked Banner",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Badge",
      type: "string",
      description: 'The text beside the tick — e.g. "Fact-Checked".',
      validation: (rule) =>
        rule
          .required()
          .max(24)
          .warning("The badge sits on one line — keep it under ~24 characters."),
    }),
    defineField({
      name: "body",
      title: "Statement",
      type: "blockContent",
      description:
        "Who wrote and reviewed the page. Use links for the editorial guidelines and the approving attorney — plain paragraphs only, no headings or lists.",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { label: "label" },
    prepare({ label }) {
      return { title: "Fact-Checked Banner", subtitle: label || "No badge set" };
    },
  },
});

/**
 * The per-page banner controls, as a fresh field each call — `practiceArea` and
 * `locationPage` both take one, and a factory keeps the two from drifting. The
 * only difference is which field group it lands in.
 *
 * Sits last on the page so it reads as a setting rather than content. Collapsed
 * by default, and carries no `description` of its own — the title says it, and
 * the explaining happens on the fields inside (D10).
 *
 * ON IS THE DEFAULT, AND `initialValue` ALONE CAN'T DELIVER THAT: it only fires
 * for newly created documents, so every practice area and location page that
 * already existed has no `factCheck` object at all. The query coalesces a
 * missing value to `true`; treat only an explicit `false` as off.
 */
export const factCheckField = (group: string) =>
  defineField({
    name: "factCheck",
    title: "Fact-Checked Banner",
    type: "object",
    group,
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: "show",
        title: "Show the banner",
        type: "boolean",
        initialValue: true,
        description:
          "On unless you turn it off. The banner sits at the foot of the page, under both the body and the sidebar.",
      }),
      defineField({
        name: "content",
        title: "Override",
        type: "factCheckContent",
        description:
          "Optional. Leave empty and the page uses the wording from Site Settings → Fact-Checked Banner. Fill this in only when this page needs to say something different.",
      }),
    ],
    preview: {
      select: { show: "show", label: "content.label" },
      prepare({ show, label }) {
        return {
          title: "Fact-Checked Banner",
          subtitle:
            show === false
              ? "Hidden on this page"
              : label
                ? `Shown — overridden ("${label}")`
                : "Shown — site-wide wording",
        };
      },
    },
  });
