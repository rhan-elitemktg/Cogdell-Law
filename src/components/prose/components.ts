/**
 * The shared Portable Text renderer map for `blockContent` (D12).
 *
 * Spread this into every <PortableText> that renders body copy, then add the
 * band's own `normal` paragraph on top:
 *
 *   components={{
 *     ...proseComponents,
 *     block: { ...proseComponents.block, normal: AboutParagraph },
 *   }}
 *
 * Why the indirection: astro-portabletext defaults an unmapped h2 to a bare
 * <h2>, which the site's `* { margin: 0 }` reset leaves with no spacing at all.
 * Mapping them to prose__* classes gives the SEO team's headings and lists real
 * styling wherever they're added.
 *
 * Paragraphs are deliberately NOT mapped here — each band styles its own
 * (.about__body, .hero__lead …), and a shared rule would fight them.
 */
import ProseH2 from "./ProseH2.astro";
import ProseH3 from "./ProseH3.astro";
import ProseH4 from "./ProseH4.astro";
import ProseQuote from "./ProseQuote.astro";
import ProseList from "./ProseList.astro";
import ProseOrderedList from "./ProseOrderedList.astro";
import ProseListItem from "./ProseListItem.astro";
import ProseLink from "./ProseLink.astro";

export const proseComponents = {
  block: {
    h2: ProseH2,
    h3: ProseH3,
    h4: ProseH4,
    blockquote: ProseQuote,
  },
  list: {
    bullet: ProseList,
    number: ProseOrderedList,
  },
  listItem: {
    bullet: ProseListItem,
    number: ProseListItem,
  },
  mark: {
    link: ProseLink,
  },
};
