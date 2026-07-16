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
  "contactPage",
  "ourFirmPage",
  "videosPage",
  "newsPage",
  "practiceAreasPage",
  "consult",
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
      page(S, "ourFirmPage", "Our Firm Page", icons.users),
      page(S, "practiceAreasPage", "Practice Areas Page", icons.case),
      page(S, "newsPage", "News Page", icons.documents),
      page(S, "videosPage", "Videos Page", icons.play),
      page(S, "contactPage", "Contact Page", icons.envelope),
      S.listItem()
        .title("Privacy Policy")
        .icon(icons.document)
        .child(S.document().schemaType("legalPage").documentId("privacy").title("Privacy Policy")),
      S.listItem()
        .title("Disclaimer")
        .icon(icons.document)
        .child(S.document().schemaType("legalPage").documentId("disclaimer").title("Disclaimer")),
      S.divider(),
      page(S, "ctaBar", "CTA Bar", icons.bell),
      page(S, "consult", "Consult", icons.envelope),
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
      orderableDocumentListDeskItem({
        type: "faq",
        title: "FAQs",
        icon: icons["help-circle"],
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "video",
        title: "Videos",
        icon: icons.play,
        S,
        context,
      }),
      ...S.documentTypeListItems().filter(
        (li) => !SINGLETONS.includes(li.getId() as string) && !["attorney", "faq", "video", "legalPage"].includes(li.getId() as string),
      ),
    ]);
