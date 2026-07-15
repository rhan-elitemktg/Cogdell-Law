import type { StructureResolver } from "sanity/structure";
import { icons } from "@sanity/icons";

// Singleton document types — pinned individually and excluded from the generic
// document lists so they can't be duplicated. Also drives the "＋ Create" filter
// in sanity.config.ts, so keep this list as the single source of truth.
export const SINGLETONS = ["firmDetails", "homePage"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home Page")
        .icon(icons.home)
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Home Page"),
        ),
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
