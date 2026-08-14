// Harvest the podcast channel's video metadata into scripts/data/youtube-episodes.json.
//
// Plain Node rather than `npx sanity exec` (which the seed scripts use) because this
// touches YouTube only — it never opens a Sanity client. Run it yourself:
//
//   node scripts/fetch-youtube-episodes.mjs
//
// The JSON it writes is COMMITTED. That is the point: the import becomes reproducible,
// reviewable as a diff, and re-runnable without hitting YouTube again. `yt-dlp` is a
// local developer tool, not a build dependency — nothing in `astro build` reads it.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const run = promisify(execFile);

const CHANNEL = "https://www.youtube.com/@cogdelllawuncensored/videos";
const OUT = "scripts/data/youtube-episodes.json";

// Audio-only re-uploads of two videos that also exist as video. Verified: each has a
// byte-identical runtime to its twin (1072.0s and 4268.0s). Their surviving twins are
// 0srbD2hn2vM and x6zwhAANhcY, which are the copies already in Sanity.
const EXCLUDE = new Set(["QD-cFCWFNUo", "nrbzXSnNcPY"]);

// What we expected when this was written. The channel WILL grow — a mismatch is a
// prompt to review the new videos for further audio-only duplicates, not a bug to
// loosen away. See the duplicate analysis in the plan.
const EXPECTED_TOTAL = 84;

// yt-dlp does NOT interpret "\t" in --print; it emits a literal backslash-t. Use a
// sentinel that cannot occur in a title.
const SEP = " :::: ";
const CHUNK = 10; // videos per yt-dlp invocation for the slow per-video pass

async function ytdlp(args) {
  const { stdout } = await run("yt-dlp", ["--no-cache-dir", "--no-warnings", ...args], {
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout;
}

/** Pass 1 — one request for the whole channel. Gives id/title/duration, but NO dates. */
async function listChannel() {
  const out = await ytdlp([
    "--flat-playlist",
    "--print",
    `%(id)s${SEP}%(duration)s${SEP}%(title)s`,
    CHANNEL,
  ]);
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, duration, ...rest] = line.split(SEP);
      return { id, duration: Number(duration) || null, rawTitle: rest.join(SEP) };
    });
}

/**
 * Pass 2 — dates and descriptions, which --flat-playlist omits entirely.
 *
 * Not `--extractor-args youtubetab:approximate_date`: that snaps every upload to the
 * 15th of its month, so a month's videos all share one date. Useless for display and
 * for ordering. The real dates cost one extraction per video.
 *
 * Descriptions are separated by a sentinel line because they are multi-line.
 */
async function fetchDetails(ids) {
  const out = await ytdlp([
    "--skip-download",
    "--print",
    `%(id)s${SEP}%(upload_date)s`,
    "--print",
    "---DESC---",
    "--print",
    "%(description)s",
    "--print",
    "---END---",
    ...ids.map((id) => `https://www.youtube.com/watch?v=${id}`),
  ]);

  const details = new Map();
  let current = null;
  let buf = null;
  for (const line of out.split("\n")) {
    if (line === "---DESC---") { buf = []; continue; }
    if (line === "---END---") {
      if (current) details.set(current.id, { ...current, description: buf.join("\n").trim() });
      current = null; buf = null; continue;
    }
    if (buf) { buf.push(line); continue; }
    if (line.includes(SEP)) {
      const [id, uploadDate] = line.split(SEP);
      current = { id, uploadDate: /^\d{8}$/.test(uploadDate) ? uploadDate : null };
    }
  }
  return details;
}

const log = (m) => process.stdout.write(`${m}\n`);

const all = await listChannel();
log(`channel returned ${all.length} videos`);
if (all.length !== EXPECTED_TOTAL) {
  log(
    `\n  !! Expected ${EXPECTED_TOTAL}. The channel has changed since this was written.\n` +
      `     Review the new videos for audio-only duplicates before importing, then\n` +
      `     update EXPECTED_TOTAL. Continuing.\n`,
  );
}

const kept = all.filter((v) => !EXCLUDE.has(v.id));
log(`excluded ${all.length - kept.length} audio-only duplicate(s) -> ${kept.length} to import`);

// Resume support: keep anything already harvested so an interrupted run continues.
let existing = [];
try {
  existing = JSON.parse(await readFile(OUT, "utf8")).episodes ?? [];
} catch {
  /* first run */
}
const have = new Map(existing.map((e) => [e.id, e]));

const todo = kept.filter((v) => !have.has(v.id) || !have.get(v.id).uploadDate);
log(`${have.size} already harvested, ${todo.length} to fetch\n`);

for (let i = 0; i < todo.length; i += CHUNK) {
  const batch = todo.slice(i, i + CHUNK);
  const details = await fetchDetails(batch.map((v) => v.id));
  for (const v of batch) {
    const d = details.get(v.id);
    have.set(v.id, { ...v, uploadDate: d?.uploadDate ?? null, description: d?.description ?? "" });
  }
  const episodes = kept.map((v) => have.get(v.id)).filter(Boolean);
  await mkdir(dirname(OUT), { recursive: true });
  // Checkpoint after every chunk, so an interrupted run resumes rather than restarts.
  await writeFile(OUT, JSON.stringify({ fetchedFrom: CHANNEL, count: episodes.length, episodes }, null, 2));
  log(`  ${Math.min(i + CHUNK, todo.length)}/${todo.length}`);
}

const episodes = kept.map((v) => have.get(v.id)).filter(Boolean);
const missing = episodes.filter((e) => !e.uploadDate);
log(`\nwrote ${OUT} — ${episodes.length} episodes`);
if (missing.length) log(`  !! ${missing.length} without an upload date: ${missing.map((m) => m.id).join(", ")}`);
