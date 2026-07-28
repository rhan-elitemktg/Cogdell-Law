/**
 * The renderer map for `pageBody` fields — `practiceArea.body` and
 * `locationPage.body` only (D16). It's `proseBodyComponents` plus the `type` map
 * that renders the body's insertable layout blocks.
 *
 * Kept SEPARATE from proseBodyComponents on purpose. Legal pages, FAQ answers,
 * attorney bios, news and podcast bodies are all `blockContent` and can't hold
 * these blocks, so they must never be handed a map that would render them. It's
 * insurance rather than a fix today — but it puts the containment boundary in
 * code instead of a comment, which matters because four more blocks are coming
 * and "just add it to the shared map" gets more tempting with each one.
 *
 * astro-portabletext's key for custom objects is `type` (singular), keyed by
 * `_type`; the components receive `{ node, index, isInline }`.
 *
 * ADDING BLOCK #2: one line here, one line in schemaTypes/pageBody.ts.
 */
import { proseBodyComponents } from "./bodyComponents";
import BodyCta from "../body/BodyCta.astro";
import BodyPhoneBar from "../body/BodyPhoneBar.astro";

export const pageBodyComponents = {
  ...proseBodyComponents,
  type: { bodyCta: BodyCta, bodyPhoneBar: BodyPhoneBar },
};
