import type { StructureResolver } from "sanity/structure";

// Singleton document types — pinned individually and excluded from the generic
// document lists so they can't be duplicated.
const SINGLETONS = ["firmDetails"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Firm Details")
        .child(
          S.document()
            .schemaType("firmDetails")
            .documentId("firmDetails")
            .title("Firm Details"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (li) => !SINGLETONS.includes(li.getId() as string),
      ),
    ]);
