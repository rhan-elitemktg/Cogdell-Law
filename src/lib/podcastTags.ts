/**
 * The Cogdell Counsel podcast tags — the single source of truth, shared by the
 * Sanity schema (`podcast.tag` options.list) and the frontend (filter row on
 * /podcast + the badge on each card).
 *
 * Kept in `src/lib` (no `sanity`/`@sanity/icons` imports) rather than in the
 * schema file so the components can import it without pulling Studio code into
 * the client bundle — the same reason TrialResults hardcodes its filters.
 *
 * `value` is the stable key stored on the document and used as the filter id /
 * `data-tag`; `title` is what's printed on the card badge and filter button.
 */
export const PODCAST_TAGS = [
  { title: "White Collar", value: "white-collar" },
  { title: "Federal Defense", value: "federal-defense" },
  { title: "Trial Strategy", value: "trial-strategy" },
  { title: "Grand Jury", value: "grand-jury" },
  { title: "Health Care Fraud", value: "health-care-fraud" },
  { title: "Securities Fraud", value: "securities-fraud" },
  { title: "Appeals", value: "appeals" },
  { title: "The Firm", value: "the-firm" },
] as const;

export type PodcastTagValue = (typeof PODCAST_TAGS)[number]["value"];

/** value → printed label, for cards that only carry the stored `tag` value. */
export const PODCAST_TAG_LABEL: Record<string, string> = Object.fromEntries(
  PODCAST_TAGS.map((t) => [t.value, t.title]),
);
