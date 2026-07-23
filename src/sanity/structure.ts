import type { StructureResolver } from "sanity/structure";
import { icons } from "@sanity/icons";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

// Singleton document types — one fixed document each, pinned individually and
// excluded from the generic document lists so they can't be duplicated. Also
// drives the "＋ Create" filter in sanity.config.ts.
export const SINGLETONS = [
  "firmDetails",
  "globalSeo",
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

// Ordinary (non-singleton) document types that get their own curated list in the
// structure below. Kept alongside SINGLETONS so the safety-net catch-all knows
// what's already placed and never silently orphans a type.
const COLLECTIONS = [
  "attorney",
  "practiceArea",
  "serviceCity",
  "locationPage",
  "video",
  "faq",
  "testimonial",
  "newsItem",
  "trialResult",
];

// legalPage isn't a singleton, but it's managed like two pseudo-singletons: the
// only legal pages are Privacy and Disclaimer, pinned by fixed id below. It's
// excluded from "＋ Create" (see sanity.config.ts) so a third, unreachable legal
// page can't be spawned, and listed here so the catch-all leaves it alone.
export const NON_CREATABLE = [...SINGLETONS, "legalPage"];

// Every type placed explicitly below — anything NOT in here falls through to the
// safety-net catch-all so a newly-added document type is never lost.
const PLACED = [...NON_CREATABLE, ...COLLECTIONS];

/** Pinned page singleton: one Studio entry per fixed-id document. */
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

/** Pinned fixed-id document of a shared type (e.g. the two legalPage docs). */
const fixedDoc = (
  S: Parameters<StructureResolver>[0],
  type: string,
  id: string,
  title: string,
  icon: (typeof icons)[keyof typeof icons],
) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(id).title(title));

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      // ── Pages ──────────────────────────────────────────────────────────────
      // The one-of-a-kind page documents. Grouped so the sidebar reads as a site
      // map, and so "Attorneys Page" (this) reads distinctly from the "Attorney
      // Bios" collection below.
      S.listItem()
        .title("Pages")
        .icon(icons["master-detail"])
        .child(
          S.list()
            .title("Pages")
            .items([
              page(S, "homePage", "Home Page", icons.home),
              page(S, "trialExperiencePage", "Trial Experience Page", icons.case),
              page(S, "testimonialsPage", "Testimonials Page", icons.blockquote),
              page(S, "attorneysPage", "Attorneys Page", icons.users),
              page(S, "ourFirmPage", "Our Firm Page", icons.book),
              page(S, "practiceAreasPage", "Practice Areas Page", icons["th-large"]),
              page(S, "newsPage", "News Page", icons.documents),
              page(S, "videosPage", "Videos Page", icons.play),
              page(S, "contactPage", "Contact Page", icons.envelope),
              // The rarely-edited legal pages, tucked out of the main list.
              S.listItem()
                .title("Legal")
                .icon(icons.document)
                .child(
                  S.list()
                    .title("Legal")
                    .items([
                      fixedDoc(S, "legalPage", "privacy", "Privacy Policy", icons.lock),
                      fixedDoc(
                        S,
                        "legalPage",
                        "disclaimer",
                        "Disclaimer",
                        icons["warning-outline"],
                      ),
                    ]),
                ),
            ]),
        ),

      // ── Collections ────────────────────────────────────────────────────────
      // The repeatable records. The first six are drag-to-reorder (their order
      // drives the site); the last three are plain lists.
      S.listItem()
        .title("Collections")
        .icon(icons.stack)
        .child(
          S.list()
            .title("Collections")
            .items([
              orderableDocumentListDeskItem({
                type: "attorney",
                title: "Attorney Bios",
                icon: icons.user,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "practiceArea",
                title: "Practice Areas",
                icon: icons.tag,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "serviceCity",
                title: "Service Cities",
                icon: icons.pin,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "locationPage",
                title: "Location Pages",
                icon: icons.marker,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "video",
                title: "Videos",
                icon: icons.video,
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
              // Plain lists (not drag-ordered) — placed explicitly rather than
              // left to fall through the catch-all, so they sit with their peers.
              S.documentTypeListItem("testimonial")
                .title("Testimonials")
                .icon(icons["double-quote"]),
              S.documentTypeListItem("newsItem")
                .title("News Articles")
                .icon(icons["document-text"]),
              S.documentTypeListItem("trialResult")
                .title("Trial Results")
                .icon(icons.star),
            ]),
        ),

      // ── Site Settings ──────────────────────────────────────────────────────
      // Site-wide configuration, kept together and away from page content.
      S.listItem()
        .title("Site Settings")
        .icon(icons.controls)
        .child(
          S.list()
            .title("Site Settings")
            .items([
              page(S, "firmDetails", "Firm Details", icons.cog),
              page(S, "ctaBar", "Call-to-Action Bar", icons.bell),
              page(S, "consult", "Consultation Form", icons.calendar),
              page(S, "globalSeo", "Global SEO Settings", icons.search),
            ]),
        ),

      // Safety net: surface any document type not explicitly placed above, so a
      // newly-added type is never silently orphaned. Currently matches nothing.
      ...S.documentTypeListItems().filter(
        (li) => !PLACED.includes(li.getId() as string),
      ),
    ]);
