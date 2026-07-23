// Flatten Portable Text to a plain string.
//
// Needed wherever block content has to become an attribute or a JSON value
// rather than markup — FAQPage structured data, and the attorney bio's meta
// description. Only spans carry text, so lists and headings flatten to their
// words and everything else is skipped.

interface Span {
  _type?: string;
  text?: string;
}

interface Block {
  _type?: string;
  children?: Span[];
}

/** Plain text from Portable Text blocks. Paragraph breaks become spaces. */
export function toPlainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return (blocks as Block[])
    .map((block) =>
      block?._type === "block"
        ? (block.children ?? []).map((child) => child?.text ?? "").join("")
        : "",
    )
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain text truncated to `max` characters on a word boundary, with an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:]$/, "")}…`;
}
