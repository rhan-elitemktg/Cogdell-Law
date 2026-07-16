/**
 * Converts the static `Block[]` content model (data/practice-areas.ts etc.) into
 * Sanity Portable Text (`blockContent`). Shared by every seed that migrates the
 * old block content — legal pages, practice areas, areas we serve.
 *
 *   { p: string | Inline[] }   → normal block (Inline → link marks)
 *   { ul: (string|Inline[])[] }→ bullet listItem blocks
 *   { quote: string }          → blockquote block
 *   Inline = string | { text, href } → span, with a `link` mark for links
 *
 * A `PracticeSection` (heading + blocks) becomes an h2 block followed by its
 * converted blocks — so a whole page flattens into one blockContent array.
 *
 * Keys are derived from a caller-supplied prefix + running index, so a re-seed
 * produces identical documents (stable keys, no churn).
 */

type Inline = string | { text: string; href: string };
type Block =
  | { p: string | Inline[] }
  | { ul: (string | Inline[])[] }
  | { quote: string };
interface Section {
  heading: string;
  blocks: Block[];
}

interface PTSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}
interface PTMarkDef {
  _type: "link";
  _key: string;
  href: string;
}
interface PTBlock {
  _type: "block";
  _key: string;
  style: string;
  listItem?: "bullet";
  level?: number;
  markDefs: PTMarkDef[];
  children: PTSpan[];
}

/** Inline[] (or string) → spans + the link markDefs they reference. */
function inlineToSpans(
  value: string | Inline[],
  keyBase: string,
): { children: PTSpan[]; markDefs: PTMarkDef[] } {
  const parts = typeof value === "string" ? [value] : value;
  const children: PTSpan[] = [];
  const markDefs: PTMarkDef[] = [];
  parts.forEach((part, i) => {
    if (typeof part === "string") {
      children.push({ _type: "span", _key: `${keyBase}s${i}`, text: part, marks: [] });
    } else {
      const markKey = `${keyBase}l${i}`;
      markDefs.push({ _type: "link", _key: markKey, href: part.href });
      children.push({ _type: "span", _key: `${keyBase}s${i}`, text: part.text, marks: [markKey] });
    }
  });
  return { children, markDefs };
}

function paragraph(value: string | Inline[], key: string): PTBlock {
  const { children, markDefs } = inlineToSpans(value, key);
  return { _type: "block", _key: key, style: "normal", markDefs, children };
}

function quote(text: string, key: string): PTBlock {
  return {
    _type: "block",
    _key: key,
    style: "blockquote",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
  };
}

function listItem(value: string | Inline[], key: string): PTBlock {
  const { children, markDefs } = inlineToSpans(value, key);
  return { _type: "block", _key: key, style: "normal", listItem: "bullet", level: 1, markDefs, children };
}

export function blocksToPT(blocks: Block[], prefix: string): PTBlock[] {
  const out: PTBlock[] = [];
  blocks.forEach((block, i) => {
    const key = `${prefix}b${i}`;
    if ("p" in block) out.push(paragraph(block.p, key));
    else if ("quote" in block) out.push(quote(block.quote, key));
    else if ("ul" in block) block.ul.forEach((item, j) => out.push(listItem(item, `${key}i${j}`)));
  });
  return out;
}

function heading(text: string, key: string): PTBlock {
  return {
    _type: "block",
    _key: key,
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
  };
}

/**
 * Flatten intro + sections into one blockContent array.
 * @param prefix stable key namespace (e.g. the doc slug) so re-seeds don't churn.
 */
export function toBlockContent(
  { intro, sections }: { intro?: Block[]; sections?: Section[] },
  prefix = "c",
): PTBlock[] {
  const out: PTBlock[] = [];
  if (intro?.length) out.push(...blocksToPT(intro, `${prefix}-intro-`));
  sections?.forEach((section, i) => {
    out.push(heading(section.heading, `${prefix}-h${i}`));
    out.push(...blocksToPT(section.blocks, `${prefix}-s${i}-`));
  });
  return out;
}

export type { Block, Section, Inline };
