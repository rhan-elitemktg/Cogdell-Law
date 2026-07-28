import { defineType, defineArrayMember } from "sanity";
import { bodyBlockMember } from "./blockContent";

/**
 * `blockContent` PLUS insertable layout blocks — the body field for the two
 * long-form page types that own a full content column: `practiceArea.body` and
 * `locationPage.body` (D16).
 *
 * A strict SUPERSET, not a second rich-text standard. The text member comes from
 * the same `bodyBlockMember()` factory `blockContent` uses, so the toolbar is
 * identical by construction and D12 still holds — what differs is a set of
 * layout blocks, which isn't rich text at all.
 *
 * Everything else — legal pages, attorney bios, FAQ answers, news and podcast
 * bodies, every homepage band — stays on `blockContent` and gets no Insert
 * control. That containment is the whole reason this type exists.
 *
 * Every member below is a SIBLING of the text member, i.e. block-level. Never
 * move one into the block member's `of:` — that is Sanity's inline-object slot,
 * and it would let an editor drop a navy banner into the middle of a sentence.
 *
 * ADDING BLOCK #2: write the object type, register it in `schemaTypes/index.ts`,
 * add one line here, add one line to `components/prose/pageBodyComponents.ts`.
 * Give it an icon no other member uses — the Portable Text Insert menu
 * distinguishes block types by icon alone (F23), and `options.insertMenu` (the
 * views/groups config) is only read on the plain array input, not this one.
 * Reserved so they can't collide: `bulb-outline` (Key Takeaways),
 * `mobile-device` (phone bar), `user` (attorney card), `double-quote` (quote CTA).
 */
export const pageBody = defineType({
  name: "pageBody",
  title: "Page Body",
  type: "array",
  of: [
    bodyBlockMember(),
    defineArrayMember({ type: "bodyCta" }),
    // Future (D16): bodyTakeaways, bodyPhoneBar, bodyAttorney, bodyQuoteCta.
  ],
});
