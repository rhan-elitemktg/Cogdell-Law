// Resolves a page's <head> metadata from its Sanity `seo` block, falling back to
// what the page already passed to Layout (D15).
//
// The fallbacks are the whole point: every SEO field is optional, so a page with
// an empty SEO block must render exactly the title and description it rendered
// before the fields existed. Nothing changes until an editor fills something in.
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlFor } from "../sanity/lib/image";

export const SITE_NAME = "Cogdell Law";

/** The `seo` object as any of the queries project it. All fields optional. */
export interface SeoInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  ogImage?: SanityImageSource | null;
}

export interface ResolvedSeo {
  title: string;
  description?: string;
  canonical: string;
  noIndex: boolean;
  ogImage?: string;
}

/** Blank strings from the Studio count as "not set". */
const clean = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/**
 * A page's absolute URL with any trailing slash dropped (the site's canonical
 * form). Shared with sitemap.xml so the two can never disagree.
 */
export const canonicalize = (url: URL | string) => {
  const href = typeof url === "string" ? url : url.href;
  return href.replace(/\/+$/, "");
};

/**
 * The full <title>. `metaTitle` replaces the page name only — " | Cogdell Law"
 * is always appended, so the SEO team never types the brand. The homepage's bare
 * "Cogdell Law" is preserved when it has no metaTitle of its own.
 */
export function resolveTitle(seo: SeoInput | null | undefined, fallback: string) {
  const name = clean(seo?.metaTitle) ?? fallback;
  return name === SITE_NAME ? name : `${name} | ${SITE_NAME}`;
}

/**
 * Everything Layout needs for the <head>.
 *
 * `pageUrl` is the page's own absolute URL (`Astro.url`), used as the canonical
 * unless the page overrides it. `defaultOgImage` is the site-wide fallback share
 * image from the Global SEO Setting singleton.
 */
export function resolveSeo(
  seo: SeoInput | null | undefined,
  {
    fallbackTitle,
    fallbackDescription,
    pageUrl,
    defaultOgImage,
  }: {
    fallbackTitle: string;
    fallbackDescription?: string;
    pageUrl: URL;
    defaultOgImage?: SanityImageSource | null;
  },
): ResolvedSeo {
  const image = seo?.ogImage ?? defaultOgImage ?? undefined;

  return {
    title: resolveTitle(seo, fallbackTitle),
    description: clean(seo?.metaDescription) ?? clean(fallbackDescription),
    // Trailing slashes are dropped so the canonical matches the URLs the nav and
    // sitemap.xml use (navigation.ts normalizes the same way).
    canonical: clean(seo?.canonicalUrl) ?? canonicalize(pageUrl),
    noIndex: seo?.noIndex === true,
    ogImage: image
      ? urlFor(image).width(1200).height(630).fit("crop").auto("format").url()
      : undefined,
  };
}
