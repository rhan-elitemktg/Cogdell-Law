// dist/bulk-redirects.json — the redirect table Vercel loads at the edge.
//
// vercel.json points `bulkRedirectsPath` at this file. Vercel reads vercel.json
// before the build, so redirects can't be written there from Sanity; bulk
// redirects are the one redirect surface that may be generated DURING the build
// ("the redirect files can be generated at build time as long as they end up in
// the location specified by bulkRedirectsPath" — Vercel's vercel.json reference).
//
// Two things bulk redirects can't do, which is why vercel.json still has a
// `redirects` block: wildcards and header matching. The one wildcard rule
// (/health-care-fraud-defense/:path*) stays there and is developer-managed.
//
// NOTE: no leading underscore in the filename — Astro excludes src/pages/_* from
// routing, and the file would silently never be built.
import type { APIRoute } from "astro";
import { normalizePath } from "../lib/routePaths";
import { getRedirects } from "../sanity/lib/redirects";
import { getLivePaths } from "../sanity/lib/routes";

/** https://vercel.com/docs/redirects/bulk-redirects — the fields we set. */
interface BulkRedirect {
  source: string;
  destination: string;
  statusCode: 301 | 302;
  preserveQueryParams: boolean;
}

export const GET: APIRoute = async () => {
  const [redirects, livePaths] = await Promise.all([getRedirects(), getLivePaths()]);

  const out: BulkRedirect[] = [];
  const claimed = new Set<string>();
  const skipped: string[] = [];

  for (const rule of redirects) {
    const rawSource = rule.source?.trim();
    const rawDestination = rule.destination?.trim();
    if (!rawSource || !rawDestination) continue;

    const source = normalizePath(rawSource);
    // Destinations may be external, and an external URL must not be lowercased
    // or slash-stripped — only internal paths get normalized.
    const external = /^https?:\/\//i.test(rawDestination);
    const destination = external ? rawDestination : normalizePath(rawDestination);

    // The guard that matters. Bulk redirects are evaluated before the filesystem,
    // so a source pointing at a live page would take that page off the site. The
    // Studio warns about this; here it's enforced.
    if (livePaths.has(source)) {
      skipped.push(`${source} → ${destination} (a page already lives at ${source})`);
      continue;
    }
    if (source === destination) {
      skipped.push(`${source} → ${destination} (points at itself)`);
      continue;
    }
    // Belt and braces: the Studio blocks duplicate sources, but a draft published
    // out of order could still race one through.
    if (claimed.has(source)) {
      skipped.push(`${source} → ${destination} (another redirect already claims ${source})`);
      continue;
    }
    claimed.add(source);

    const statusCode = rule.permanent === false ? 302 : 301;

    // Both slash forms. Bulk redirects are processed before any other route in
    // the deployment — including the `trailingSlash: false` normalization — and
    // they match the path exactly, so "/old-page/" would otherwise miss. The old
    // FindLaw URLs this site inherited are canonically trailing-slash, so that
    // miss would cost real inbound traffic.
    out.push({ source, destination, statusCode, preserveQueryParams: true });
    out.push({ source: `${source}/`, destination, statusCode, preserveQueryParams: true });
  }

  // Surfaces in the Vercel build log. An editor never sees this, which is why the
  // Studio carries its own warning — but it's what a developer needs when someone
  // asks why their redirect "didn't work".
  if (skipped.length) {
    console.warn(
      `[bulk-redirects] skipped ${skipped.length} redirect(s):\n  ${skipped.join("\n  ")}`,
    );
  }
  console.info(`[bulk-redirects] wrote ${out.length} rule(s) from ${redirects.length} redirect(s)`);

  return new Response(JSON.stringify(out, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
