// The site's hardcoded paths, and the one way to normalize a path.
//
// Deliberately dependency-free. sanity/lib/routes.ts imports this to assemble the
// full route list, and so does the `redirect` schema's validation — and schema
// files are loaded by the Sanity CLI during `npm run typegen`, where the
// `sanity:client` virtual module doesn't resolve. Anything imported from a schema
// has to stay clean of it.

/** Static routes backed by a Sanity document, keyed by that document's `_id`. */
export const DOCUMENT_BACKED: Record<string, string> = {
  homePage: "/",
  ourFirmPage: "/our-firm",
  attorneysPage: "/attorneys",
  practiceAreasPage: "/practice-areas",
  trialExperiencePage: "/trial-experience",
  testimonialsPage: "/testimonials",
  videosPage: "/videos",
  newsPage: "/news",
  podcastPage: "/podcast",
  contactPage: "/contact",
  privacy: "/privacy",
  disclaimer: "/disclaimer",
};

/** Routes with no document of their own. */
export const CODE_ONLY_PATHS = ["/site-map"];

/**
 * Paths that aren't sitemap entries but must never be redirected away.
 *
 * /admin is the Studio — a redirect there would lock the SEO team out of the very
 * tool they'd use to undo it. The rest are the generated endpoints and the
 * standalone consult function.
 */
export const RESERVED_PATHS = [
  "/404",
  "/admin",
  "/robots.txt",
  "/sitemap.xml",
  "/bulk-redirects.json",
  "/api/consult",
];

/** Every path known at build time, without touching Sanity. */
export const STATIC_PATHS = [
  ...Object.values(DOCUMENT_BACKED),
  ...CODE_ONLY_PATHS,
  ...RESERVED_PATHS,
];

/**
 * A path in the form both the site and Vercel treat as canonical: lowercase, one
 * leading slash, no trailing slash. "/" is left alone — it's the one path whose
 * trailing slash IS the path.
 *
 * Lowercasing matches Vercel's bulk redirects, which are case-insensitive unless
 * `caseSensitive` is set. `canonicalize()` in lib/seo.ts does the trailing-slash
 * half of this for absolute URLs; this is the path-only, comparison-safe version.
 */
export function normalizePath(path: string): string {
  const trimmed = path.trim().toLowerCase().replace(/\/+$/, "");
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** The last segment of a path — "/news/foo-bar" → "foo-bar". */
export function lastSegment(path: string): string {
  return normalizePath(path).split("/").filter(Boolean).pop() ?? "";
}
