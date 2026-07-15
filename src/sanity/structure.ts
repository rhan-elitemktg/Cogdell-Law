import type { StructureResolver } from "sanity/structure";
import { icons } from "@sanity/icons";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

// Singleton document types — pinned individually and excluded from the generic
// document lists so they can't be duplicated. Also drives the "＋ Create" filter
// in sanity.config.ts, so keep this list as the single source of truth.
export const SINGLETONS = [
  "firmDetails",
  "ctaBar",
  "homePage",
  "trialExperiencePage",
  "testimonialsPage",
  "attorneysPage",
];

/** Pinned page singleton: one Studio entry per page document. */
const page = (
  S: Parameters<StructureResolver>[0],
  id: string,
  title: string,
  icon: (typeof icons)[keyof typeof icons],
) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(id).title(title));

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      page(S, "homePage", "Home Page", icons.home),
      page(S, "trialExperiencePage", "Trial Experience Page", icons.case),
      page(S, "testimonialsPage", "Testimonials Page", icons.blockquote),
      page(S, "attorneysPage", "Attorneys Page", icons.users),
      S.divider(),
      page(S, "ctaBar", "CTA Bar", icons.bell),
      page(S, "firmDetails", "Firm Details", icons.cog),
      S.divider(),
      // Drag-to-reorder list — the card order on / and /attorneys comes from this.
      orderableDocumentListDeskItem({
        type: "attorney",
        title: "Attorneys",
        icon: icons.users,
        S,
        context,
      }),
      ...S.documentTypeListItems().filter(
        (li) => !SINGLETONS.includes(li.getId() as string) && li.getId() !== "attorney",
      ),
    ]);
