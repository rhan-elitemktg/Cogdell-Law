import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * An attorney quote dropped into a page body (D16) — navy band, accent quote
 * mark, the passage, an attribution, two buttons, and their photo on the right.
 *
 * Sibling of `bodyAttorney` and easy to confuse with it: that block is a
 * third-person introduction ("Dan has tried…"), this one puts words in the
 * attorney's own mouth. Same reference, different voice.
 *
 * The attorney is a REFERENCE — name and photo come from their record, so the
 * attribution can't drift from the headshot beside it. Both queries dereference
 * it in the `body[]{...}` projection; see D16.
 *
 * Buttons follow `bodyCta`: optional, with the house pair resolved in code and
 * the phone read from Firm Details at build time.
 *
 * NOTE: `@sanity/icons` exposes no named exports — index into `icons`. Every
 * `pageBody` member needs its own icon; the Insert menu has nothing else to tell
 * them apart (F23).
 */
export const bodyQuoteCta = defineType({
  name: "bodyQuoteCta",
  title: "Attorney Quote",
  type: "object",
  icon: icons["double-quote"],
  fields: [
    defineField({
      name: "attorney",
      title: "Attorney",
      type: "reference",
      to: [{ type: "attorney" }],
      description:
        "Who said it. Their name and photo come from the attorney's own record.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      description:
        "In their own voice, and without quotation marks — the design draws its own.",
      validation: (rule) =>
        rule
          .required()
          .max(320)
          .warning("Past ~320 characters a pull quote stops reading as one."),
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
  // Text-only, no `media` — same caution as bodyAttorney (see the note there).
  preview: {
    select: { name: "attorney.name", quote: "quote" },
    prepare({ name, quote }) {
      return {
        title: name || "Attorney Quote",
        subtitle: quote ? `Attorney Quote — “${quote}”` : "Attorney Quote",
      };
    },
  },
});
