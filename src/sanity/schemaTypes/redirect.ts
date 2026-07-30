import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";
import { STATIC_PATHS, normalizePath, lastSegment } from "../../lib/routePaths";

/**
 * A single 301/302, editable by the SEO team without a developer.
 *
 * These are collected at build time by src/pages/bulk-redirects.json.ts and
 * handed to Vercel as bulk redirects, which run at the edge BEFORE the
 * filesystem. That ordering is the whole reason for the validation below: a
 * source pointing at a page that still exists would black-hole a working page.
 * The build drops those outright — this is the earlier, friendlier warning.
 *
 * Errors here are safe, unlike the ones deliberately kept as `.warning()` on the
 * page `seo` object (see seo.ts): an invalid redirect blocks publishing this one
 * document, not the site rebuild.
 */

const API_VERSION = "2025-08-15";

/** Field values arrive as `unknown` — trimmed string or "". */
const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Both id forms of the document being edited — drafts and published are one doc. */
const selfIds = (id?: string) => {
  const published = id?.replace(/^drafts\./, "");
  return { id: published, draftId: `drafts.${published}` };
};

const SOURCES_QUERY = `*[_type == "redirect" && !(_id in [$id, $draftId])].source`;

export const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  icon: icons.transfer,
  fields: [
    defineField({
      name: "source",
      title: "Old URL",
      type: "string",
      description:
        'The path that should redirect, starting with a slash — e.g. "/old-page-name". Just the path, not the full web address. Capitalisation and a trailing slash don\'t matter.',
      validation: (rule) => [
        rule.required(),
        rule.custom((value) => {
          const raw = str(value);
          if (!raw) return true;
          if (/^https?:\/\//i.test(raw))
            return 'Enter just the path, not the full web address — e.g. "/old-page-name".';
          if (/\s/.test(raw)) return "A URL can't contain spaces.";
          if (!raw.startsWith("/"))
            return 'The old URL has to start with a slash — e.g. "/old-page-name".';
          if (normalizePath(raw) === "/")
            return "The homepage can't be redirected. Ask a developer if you genuinely need this.";
          if (raw.includes("?"))
            return "Leave off the ? and anything after it — query strings are carried across automatically.";
          return true;
        }),
        // Two redirects claiming the same URL is ambiguous — whichever the build
        // wrote last would win. Blocked rather than warned.
        rule.custom(async (value, context) => {
          const raw = str(value);
          if (!raw) return true;
          const client = context.getClient({ apiVersion: API_VERSION });
          const others = await client.fetch<(string | null)[]>(
            SOURCES_QUERY,
            selfIds(context.document?._id),
          );
          const target = normalizePath(raw);
          return (
            !(others ?? []).some((other) => other && normalizePath(other) === target) ||
            "Another redirect already uses this old URL. Edit that one instead of adding a second."
          );
        }),
        // Soft check — the authoritative one runs at build time, where the full
        // route list is available. This catches the common cases early.
        rule
          .custom(async (value, context) => {
            const raw = str(value);
            if (!raw) return true;
            const target = normalizePath(raw);

            if (STATIC_PATHS.map(normalizePath).includes(target))
              return `Warning: "${target}" is a page that still exists. This redirect will be ignored at build time so the page keeps working.`;

            const client = context.getClient({ apiVersion: API_VERSION });
            const live = await client.fetch<{
              slugs: (string | null)[] | null;
              locations: (string | null)[] | null;
            }>(`{
              "slugs": *[_type in ["attorney", "newsItem", "podcast", "practiceArea"] && defined(slug.current)].slug.current,
              "locations": *[_type == "locationPage" && defined(slug.current) && defined(city->citySlug.current)]{
                "path": "/" + city->citySlug.current + "/" + slug.current
              }.path
            }`);

            if ((live?.locations ?? []).some((path) => path && normalizePath(path) === target))
              return `Warning: "${target}" is a location page that still exists. This redirect will be ignored at build time so the page keeps working.`;

            // Slug-only match for the nested types. The practice-area tree is
            // rebuilt in JS from parent refs (practiceAreas.ts), so the full path
            // isn't reachable from GROQ — comparing the final segment is close
            // enough for a warning.
            if ((live?.slugs ?? []).includes(lastSegment(target)))
              return `Warning: "${target}" looks like a page that still exists. Double-check before publishing — if the page is live, this redirect will be ignored at build time.`;

            return true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "destination",
      title: "Redirect to",
      type: "string",
      description:
        'Where visitors should land instead. A path on this site — e.g. "/practice-areas/health-care-fraud-defense" — or a full web address starting with https:// to send them off-site.',
      validation: (rule) => [
        rule.required(),
        rule.custom((value, context) => {
          const raw = str(value);
          if (!raw) return true;
          if (/\s/.test(raw)) return "A URL can't contain spaces.";
          if (!raw.startsWith("/") && !/^https?:\/\//i.test(raw))
            return 'Use a path starting with a slash — e.g. "/our-firm" — or a full address starting with https://.';

          const source = str((context.document as { source?: unknown } | undefined)?.source);
          if (source && !/^https?:\/\//i.test(raw) && normalizePath(raw) === normalizePath(source))
            return "This redirects the page to itself, which would loop forever.";
          return true;
        }),
        // Chains (A→B→C) still resolve, but they leak link equity and burn crawl
        // budget — worth flagging to an SEO team, not worth blocking.
        rule
          .custom(async (value, context) => {
            const raw = str(value);
            if (!raw || /^https?:\/\//i.test(raw)) return true;
            const client = context.getClient({ apiVersion: API_VERSION });
            const sources = await client.fetch<(string | null)[]>(
              SOURCES_QUERY,
              selfIds(context.document?._id),
            );
            const target = normalizePath(raw);
            return (
              !(sources ?? []).some((source) => source && normalizePath(source) === target) ||
              "Warning: this points at a URL that is itself redirected, creating a chain. Point it straight at the final page instead."
            );
          })
          .warning(),
      ],
    }),
    defineField({
      name: "permanent",
      title: "Permanent",
      type: "boolean",
      initialValue: true,
      description:
        "Leave ON for a page that has moved or been replaced for good — this tells Google to pass the old page's ranking to the new one (a 301). Turn it OFF only for a temporary detour you intend to remove (a 302), which passes no ranking.",
    }),
  ],
  preview: {
    select: { source: "source", destination: "destination", permanent: "permanent" },
    prepare: ({ source, destination, permanent }) => ({
      title: source || "(no old URL set)",
      subtitle: `→ ${destination || "(nowhere)"}${permanent === false ? "  ·  temporary" : ""}`,
    }),
  },
});
