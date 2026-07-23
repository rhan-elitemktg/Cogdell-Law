import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * Firm Details singleton — the firm's identity and contact info, reused across
 * the site (header logo, footer, contact page, the derived map embed).
 *
 * This is "who the firm is," NOT the site's link structure: navigation and legal
 * links stay in code (they point at routes and join the nav system in D5).
 *
 * Social icons are keyed by `platform` and drawn in code (Footer.astro) — the
 * Studio only holds which platforms and their URLs.
 */
export const firmDetails = defineType({
  name: "firmDetails",
  title: "Firm Details",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Firm Name",
      type: "string",
      initialValue: "Cogdell Law",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "text",
      rows: 3,
      description: "The short blurb under the logo in the footer.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Main contact number, e.g. 713-426-2244",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Main contact email, e.g. info@cogdell-law.com",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "address",
      title: "Office Address",
      type: "object",
      description: "Also drives the footer map embed.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "street",
          title: "Street",
          type: "string",
          description: 'e.g. "712 Main St., Suite 2400"',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "cityStateZip",
          title: "City, State ZIP",
          type: "string",
          description: 'e.g. "Houston, TX 77002"',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "socials",
      title: "Social Links",
      type: "array",
      description:
        "Shown as icons in the footer. The icon comes from the platform; only the URL is editable.",
      of: [
        defineArrayMember({
          type: "object",
          name: "social",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "Facebook", value: "facebook" },
                  { title: "X (Twitter)", value: "x" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description:
        "Site logo. Upload the light/white version — it sits on the navy header.",
      options: { hotspot: false },
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default social share image",
      type: "image",
      description:
        "Used when a page shared on Facebook, LinkedIn or X has no share image of its own. 1200×630 works best.",
      options: { hotspot: true },
    }),
    defineField({
      name: "copyrightNotice",
      title: "Copyright notice",
      type: "string",
      description:
        'The text after the firm name in the footer — e.g. "All rights reserved." The "© <year> <firm name>" part is added automatically.',
      initialValue: "All rights reserved.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "legalLinks",
      title: "Legal Links",
      type: "array",
      description: "The links in the footer's bottom bar (Privacy, Disclaimer…).",
      of: [
        defineArrayMember({
          type: "object",
          name: "legalLink",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: 'A path, e.g. "/privacy".',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Firm Details", subtitle: title };
    },
  },
});
