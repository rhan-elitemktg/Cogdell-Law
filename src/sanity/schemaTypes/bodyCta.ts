import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A call-to-action banner dropped into a page body (D16) — navy box, centred
 * heading, an optional supporting line, and two buttons. Editors insert it from
 * the Body Content toolbar and drag it between paragraphs.
 *
 * Leaving `body` empty is not an incomplete block: that's the tighter
 * heading-plus-buttons variant in the design.
 *
 * BOTH BUTTONS ARE OPTIONAL ON PURPOSE. Leave them and the renderer supplies the
 * house pair — solid "Schedule Consultation" → /contact, and outlined
 * "Call Us <phone>" built from Site Settings → Firm Details at build time. There
 * is deliberately no `initialValue`: that would *snapshot* the number into this
 * document, so changing the firm's phone later would leave every banner already
 * placed on the old one. Resolving in code means it can't drift. Either button
 * can still be overridden here.
 *
 * NOTE: `@sanity/icons` exposes no named exports — index into `icons`. The icon
 * is not decoration: the Portable Text Insert menu distinguishes block types by
 * icon alone (F23), so every member of `pageBody` needs its own. `icons.bell` is
 * already the ctaBar singleton's.
 */
export const bodyCta = defineType({
  name: "bodyCta",
  title: "CTA Banner",
  type: "object",
  icon: icons.bolt,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description:
        'The line inside the box — e.g. "Contact a Criminal Defense Lawyer in Houston".',
      validation: (rule) =>
        rule
          .required()
          .max(70)
          .warning("Banner headings read best kept under ~70 characters."),
    }),
    defineField({
      name: "body",
      title: "Supporting line",
      type: "text",
      rows: 2,
      description:
        "Optional. A sentence or two under the heading. Leave it empty for the tighter heading-and-buttons banner.",
      validation: (rule) =>
        rule.max(200).warning("Past ~200 characters the banner starts to crowd."),
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
  preview: {
    select: {
      heading: "heading",
      body: "body",
      primary: "primaryCta.label",
      secondary: "secondaryCta.label",
    },
    // The subtitle has to say "Standard buttons" when both are empty, or a
    // finished block looks half-filled in the collapsed row — the cost of
    // resolving the defaults in code instead of with `initialValue`.
    prepare({ heading, body, primary, secondary }) {
      const buttons =
        primary || secondary
          ? [primary ?? "Schedule Consultation", secondary ?? "Call Us"].join(
              " · ",
            )
          : "Standard buttons";
      return {
        title: heading || "CTA Banner",
        subtitle: `CTA Banner — ${buttons}${body ? " · with supporting line" : ""}`,
      };
    },
  },
});
