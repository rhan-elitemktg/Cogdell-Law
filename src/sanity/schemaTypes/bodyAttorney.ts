import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * An attorney callout dropped into a page body (D16) — navy band, photo left,
 * name + a short passage + two buttons right.
 *
 * The attorney is a REFERENCE, not typed in: name and photo come from the
 * attorney document, so a new headshot or a name change lands everywhere at
 * once instead of being re-uploaded per page. `body` stays on the block, since
 * that copy is about *this* page, not about the person.
 *
 * This is the first `pageBody` block holding a reference, which is why both body
 * queries now project `body[]{...}` with a `_type ==` conditional instead of
 * taking `body` raw — see D16, and note the projection is duplicated in
 * practiceAreas.ts and areasWeServe.ts on purpose (TypeGen parses defineQuery
 * statically, so it can't be hoisted).
 *
 * Buttons follow `bodyCta`: optional, with the house pair resolved in code and
 * the phone read from Firm Details at build time so it can't drift.
 *
 * NOTE: `@sanity/icons` exposes no named exports — index into `icons`. Every
 * `pageBody` member needs its own icon; the Insert menu has nothing else to tell
 * them apart (F23).
 */
export const bodyAttorney = defineType({
  name: "bodyAttorney",
  title: "Attorney Card",
  type: "object",
  icon: icons.user,
  fields: [
    defineField({
      name: "attorney",
      title: "Attorney",
      type: "reference",
      to: [{ type: "attorney" }],
      description:
        "Their name and photo come from the attorney's own record, so updating it there updates every card.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Passage",
      type: "text",
      rows: 4,
      description:
        "What this attorney brings to *this* subject — it sits on the block, not on their record, so it can differ page to page.",
      validation: (rule) =>
        rule
          .required()
          .max(400)
          .warning("Past ~400 characters the card grows taller than its photo."),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary button",
      type: "ctaButton",
      description:
        'Optional — leave empty for the standard "Schedule Consultation" button.',
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary button",
      type: "ctaButton",
      description:
        "Optional — leave empty for the standard Call Us button. Its number comes from Site Settings → Firm Details, so it updates everywhere at once when that changes.",
    }),
  ],
  // Text-only, no `media`. Selecting an image into a preview is what crashed the
  // Podcast Episodes list (Studio LoadingPane + React 19 ref loop — see the note
  // in podcast.ts). That was a document list rather than an array item, so this
  // may well be safe; a thumbnail here would be a nice touch if someone wants to
  // try it. Not worth risking a crash in the body editor on an untested hunch.
  preview: {
    select: {
      name: "attorney.name",
      primary: "primaryCta.label",
      secondary: "secondaryCta.label",
    },
    prepare({ name, primary, secondary }) {
      const buttons =
        primary || secondary
          ? [primary ?? "Schedule Consultation", secondary ?? "Call Us"].join(
              " · ",
            )
          : "Standard buttons";
      return {
        title: name || "Attorney Card",
        subtitle: `Attorney Card — ${buttons}`,
      };
    },
  },
});
