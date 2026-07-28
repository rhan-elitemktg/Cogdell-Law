import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A "Get In Touch" bar dropped into a page body (D16) — navy band, heading on
 * the left, a small reassurance label and the phone number on the right.
 *
 * Quieter than `bodyCta`: no buttons, no supporting paragraph. It's the block to
 * reach for mid-page when a full call-to-action banner would be too loud.
 *
 * `eyebrow` and `phone` are both optional and fall back in the renderer — the
 * number comes from Site Settings → Firm Details at build time, so it can't
 * drift. Same reasoning as `bodyCta`: no `initialValue`, because that would
 * snapshot today's number into every block ever inserted.
 *
 * The override exists for location pages that advertise their own local number.
 * Leave it empty and the firm's main line is used.
 *
 * NOTE: `@sanity/icons` exposes no named exports — index into `icons`. Every
 * `pageBody` member needs its own icon; the Insert menu has nothing else to tell
 * them apart (F23).
 */
export const bodyPhoneBar = defineType({
  name: "bodyPhoneBar",
  title: "Get In Touch Bar",
  type: "object",
  icon: icons["mobile-device"],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: 'The line on the left — e.g. "Get In Touch With Us".',
      validation: (rule) =>
        rule
          .required()
          .max(48)
          .warning(
            "Past ~48 characters the heading crowds the phone number beside it.",
          ),
    }),
    defineField({
      name: "eyebrow",
      title: "Label",
      type: "string",
      description:
        'Optional — the small line above the number. Defaults to "Confidential & Privileged".',
      validation: (rule) =>
        rule.max(32).warning("Keep the label short — it sets in small caps."),
    }),
    defineField({
      name: "phone",
      title: "Phone number",
      type: "string",
      description:
        "Optional — leave empty for the firm's main line from Site Settings → Firm Details. Set it only when this page advertises its own local number.",
    }),
  ],
  preview: {
    select: { heading: "heading", phone: "phone" },
    prepare({ heading, phone }) {
      return {
        title: heading || "Get In Touch Bar",
        subtitle: `Get In Touch Bar — ${phone ?? "firm phone"}`,
      };
    },
  },
});
