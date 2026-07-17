/**
 * The renderer map for long-form prose BODIES — practice areas, legal pages,
 * news articles. It's `proseComponents` plus a `normal` paragraph mapped to
 * `prose__p`, since these bodies have a standard paragraph style (unlike the
 * homepage bands, which each style their own).
 */
import { proseComponents } from "./components";
import ProseParagraph from "./ProseParagraph.astro";

export const proseBodyComponents = {
  ...proseComponents,
  block: { ...proseComponents.block, normal: ProseParagraph },
};
