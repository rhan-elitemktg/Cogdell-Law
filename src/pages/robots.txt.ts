// robots.txt, generated so the "Discourage this site from being crawled" switch
// (Global SEO Settings) can block crawlers site-wide (D15).
//
// When the switch is ON, every page also carries a `noindex` meta tag (Layout);
// the Disallow here is the belt to that suspenders. When OFF, this is the normal
// allow-all file pointing at the sitemap. Replaces the former static
// public/robots.txt so the toggle has somewhere to take effect.
import type { APIRoute } from "astro";
import { canonicalize } from "../lib/seo";
import { getGlobalSeo } from "../sanity/lib/seo";

export const GET: APIRoute = async ({ site }) => {
  const origin = canonicalize(site?.href ?? "https://www.cogdell-law.com");
  const globalSeo = await getGlobalSeo();

  const body = globalSeo?.discourageCrawling
    ? // Keep the whole site out of search while it's on its temporary address.
      "User-agent: *\nDisallow: /\n"
    : [
        "User-agent: *",
        "Allow: /",
        "",
        "# The embedded Sanity Studio — an editor tool, not content.",
        "Disallow: /admin",
        "",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
