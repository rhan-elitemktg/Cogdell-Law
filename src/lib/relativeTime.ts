/**
 * "3 months ago" from a date — review timestamps in the body testimonial block.
 *
 * The rest of the site prints absolute dates (podcasts, news). This is the one
 * deliberate exception: a review reads as current when it's dated the way Google
 * dates one, and "March 2025" invites the reader to do the subtraction.
 *
 * IT IS COMPUTED AT BUILD TIME. The site is static, so the string freezes until
 * the next deploy — publishing fires the deploy hook, so it refreshes whenever
 * anyone touches content, but a long quiet spell will let it drift behind.
 * Callers must therefore put the real date in `<time datetime="...">`, so the
 * markup stays correct even when the visible text is stale.
 */

// Each step is how many of that unit make up the next one.
const DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" }, // mean weeks per month
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
] as const;

const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

/**
 * Relative time from `iso` to `now`. Returns "" for a missing or unparseable
 * date, so callers can simply drop the element.
 */
export function relativeTime(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return "";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";

  // Negative for the past, which is what Intl expects.
  let duration = (then.getTime() - now.getTime()) / 1000;
  for (const { amount, unit } of DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return "";
}
