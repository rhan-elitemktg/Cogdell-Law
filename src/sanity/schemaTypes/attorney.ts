import { defineType, defineField, defineArrayMember } from "sanity";
import { icons } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/** A list of short strings — used for the several credential blocks below. */
const stringList = (name: string, title: string, description: string, required = false) =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
    description,
    ...(required ? { validation: (rule: any) => rule.required().min(1) } : {}),
  });

/**
 * An attorney. The single source of truth for a person, used in four places:
 *
 *  - the homepage / /attorneys cards — name, role, photo, `credential`
 *  - /attorney/[slug] — the full bio page
 *
 * `role` is deliberately ONE field. The cards and the bio pages used to disagree
 * ("Founding Attorney" vs "Principal & Founder"; "Attorney" vs "Of Counsel"),
 * which meant the live site contradicted itself about a formal designation. The
 * bio page's wording won — see docs/sanity-integration.md F15.
 *
 * Optional list fields simply omit their section when empty, so a lighter bio
 * never leaves an empty heading on the page.
 */
export const attorney = defineType({
  name: "attorney",
  title: "Attorneys",
  type: "document",
  icon: icons.user,
  // Drag-to-reorder in the Studio (D2). Documents have no inherent order, and
  // attorneys have no curating page to supply one — so the rank lives here.
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "attorney" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The URL segment — /attorney/<slug>. Changing it breaks existing links.",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description:
        'The professional title, shown on the cards AND the bio page — e.g. "Of Counsel", "Principal & Founder". One value everywhere, on purpose.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "credential",
      title: "Card blurb",
      type: "string",
      description:
        'The one-line summary under the name on the homepage / attorneys cards — e.g. "Federal appeals & post-conviction". Not shown on the bio page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      description: "Headshot. Use the hotspot to control cropping on the cards.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photoAlt",
      title: "Photo alt text",
      type: "string",
      description: "Describes the photo for screen readers and search engines.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description: 'Display form — e.g. "713-426-2244".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description:
        'Optional. When set, the bio page\'s "Email" button opens a mail client; otherwise it points at the contact form.',
      validation: (rule) => rule.email(),
    }),
    stringList(
      "practiceTags",
      "Practice tags",
      "The practice areas listed on the bio page.",
      true,
    ),
    defineField({
      name: "bio",
      title: "Biography",
      type: "blockContent",
      description: "Optional — some attorneys have none, and the section is then omitted.",
    }),
    defineField({
      name: "education",
      title: "Education",
      type: "array",
      of: [defineArrayMember({ type: "educationEntry" })],
      validation: (rule) => rule.required().min(1),
    }),
    stringList("barAdmissions", "Bar admissions", "Courts and bars, one per line.", true),
    stringList("honors", "Honors", "Awards and recognitions, one per line.", true),
    stringList("classesSeminars", "Classes & seminars", "Optional."),
    stringList("publishedWorks", "Published works", "Optional."),
    stringList("associations", "Associations", "Optional."),
    stringList("pastPositions", "Past positions", "Optional."),
    stringList("representativeCases", "Representative cases", "Optional."),
    defineField({
      name: "consult",
      title: "Consult override",
      type: "consultContent",
      description:
        "Optional. Leave empty to use the site-wide Consult; fill this in only to give this page its own wording.",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
