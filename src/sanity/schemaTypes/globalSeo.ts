import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * Global SEO Setting — a singleton for site-wide search settings that aren't
 * firm identity (D15). Kept separate from Firm Details on purpose: Firm Details
 * is "who the firm is" (name, address, socials — which also feed the JSON-LD),
 * while this holds the knobs that only exist to serve SEO.
 *
 * Per-page overrides live on each page's own `seo` object and are unaffected by
 * anything here — these are only the fallbacks.
 */
export const globalSeo = defineType({
  name: "globalSeo",
  title: "Global SEO Settings",
  type: "document",
  icon: icons.search,
  fields: [
    defineField({
      name: "discourageCrawling",
      title: "Discourage this site from being crawled",
      type: "boolean",
      description:
        "When ON, the whole site is hidden from Google and other search engines (every page gets a 'noindex' tag and robots.txt blocks crawlers). Use this while the site is on its temporary address. ⚠️ TURN THIS OFF at launch, or the real site will never appear in search.",
      initialValue: false,
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default social share image",
      type: "image",
      description:
        "Shown when a shared page has no share image of its own. 1200×630 works best. Individual pages can override this in their own SEO settings.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { discouraged: "discourageCrawling" },
    prepare: ({ discouraged }) => ({
      title: "Global SEO Settings",
      subtitle: discouraged ? "⚠️ Hidden from search engines" : undefined,
    }),
  },
});
