import type { StructureResolver } from "sanity/structure";
import { icons } from "@sanity/icons";

// Singleton document types — pinned individually and excluded from the generic
// document lists so they can't be duplicated. Also drives the "＋ Create" filter
// in sanity.config.ts, so keep this list as the single source of truth.
export const SINGLETONS = [
  "firmDetails",
  "homePage",
  "trialExperiencePage",
  "testimonialsPage",
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

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      page(S, "homePage", "Home Page", icons.home),
      page(S, "trialExperiencePage", "Trial Experience Page", icons.case),
      page(S, "testimonialsPage", "Testimonials Page", icons.blockquote),
      S.divider(),
      page(S, "firmDetails", "Firm Details", icons.cog),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (li) => !SINGLETONS.includes(li.getId() as string),
      ),
    ]);
