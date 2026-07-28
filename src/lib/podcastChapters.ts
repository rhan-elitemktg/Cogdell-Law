/**
 * Chapter markers for a podcast episode — parsed from the pasted block an editor
 * types into `podcast.chapters` in the Studio, one chapter per line:
 *
 *   00:00 Intro
 *   02:14 Meeting Dick DeGuerin
 *   1:02:14 — Cross-examination
 *
 * A paste block (rather than an array of objects) because the timestamps already
 * exist somewhere else — the YouTube description, the Buzzsprout chapter editor —
 * so the editor copies once instead of clicking through twenty two-field rows.
 * It also means the identical text can be pasted into Buzzsprout, which is what
 * makes Spotify's own player show the same chapters. Spotify's automatic chapters
 * are internal to Spotify: no API, no RSS, nothing to pull.
 *
 * Kept in `src/lib` (no `sanity` imports) so both the schema's validation and the
 * player component can import it — same reason as `podcastTags.ts`.
 */

export interface PodcastChapter {
  /** Seek target, in seconds. */
  seconds: number;
  /** Normalized for display — "2:14", or "1:02:14" once there are hours. */
  label: string;
  title: string;
}

/**
 * Leading timestamp, then the title. Tolerates the shapes people actually paste:
 * "00:00 Intro", "(00:00) Intro", "02:14 - Meeting Dick DeGuerin",
 * "1:02:14 — Cross-examination", "00:00: Intro".
 */
const LINE = /^\(?(\d{1,3}):([0-5]?\d)(?::([0-5]?\d))?\)?\s*[-–—|:]?\s*(\S.*)$/;

const pad = (n: number) => String(n).padStart(2, "0");

function parseLine(line: string): PodcastChapter | null {
  const m = LINE.exec(line.trim());
  if (!m) return null;

  // Three digit groups means H:MM:SS; two means MM:SS.
  const [h, min, sec] = m[3] ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, Number(m[1]), Number(m[2])];

  return {
    seconds: h * 3600 + min * 60 + sec,
    label: h > 0 ? `${h}:${pad(min)}:${pad(sec)}` : `${min}:${pad(sec)}`,
    title: m[4].trim(),
  };
}

/** Non-blank lines, paired with their 1-based line number (for validation). */
function contentLines(raw?: string | null): Array<[number, string]> {
  return (raw ?? "")
    .split("\n")
    .map((line, i) => [i + 1, line] as [number, string])
    .filter(([, line]) => line.trim() !== "");
}

/**
 * Parse a pasted chapter block. Source order is preserved — that's the order the
 * editor pasted, and the Studio warns them when it isn't ascending. Unparseable
 * lines are dropped here; `badChapterLines` is what stops them being pasted.
 */
export function parseChapters(raw?: string | null): PodcastChapter[] {
  return contentLines(raw)
    .map(([, line]) => parseLine(line))
    .filter((c): c is PodcastChapter => c !== null);
}

/** 1-based line numbers that don't start with a timestamp — for Studio validation. */
export function badChapterLines(raw?: string | null): number[] {
  return contentLines(raw)
    .filter(([, line]) => parseLine(line) === null)
    .map(([n]) => n);
}
