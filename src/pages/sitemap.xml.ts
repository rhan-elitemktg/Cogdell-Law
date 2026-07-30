// sitemap.xml, generated from the same helpers that build the routes (D15).
//
// Hand-rolled rather than @astrojs/sitemap because that integration's `filter`
// is synchronous and can't see the per-page `noIndex` toggle — flagged pages
// would still be submitted to Google, making the toggle a half-feature.
//
// Route assembly lives in sanity/lib/routes.ts, shared with bulk-redirects.json.
// This file's only job is to drop the hidden pages and render the XML.
import type { APIRoute } from "astro";
import { canonicalize } from "../lib/seo";
import { getSiteEntries } from "../sanity/lib/routes";

const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const origin = canonicalize(site?.href ?? "https://www.cogdell-law.com");
  const entries = await getSiteEntries();

  const urls = entries
    .filter((entry) => entry.noIndex !== true)
    .map((entry) => {
      const loc = xmlEscape(canonicalize(`${origin}${entry.path}`) || origin);
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
