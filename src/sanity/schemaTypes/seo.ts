import { defineType, defineField } from "sanity";

/**
 * Per-page search metadata (D15). One shared object attached to every routed
 * document — the 9 page singletons plus practiceArea, locationPage, legalPage,
 * newsItem and attorney — so the SEO team can tune any page in the Studio
 * without a code change.
 *
 * EVERY FIELD IS OPTIONAL BY DESIGN. Left empty, a page renders exactly the
 * title and description it rendered before this type existed (the fallbacks
 * live in `src/lib/seo.ts`), so adding the field to a document is a no-op until
 * someone deliberately fills it in.
 *
 * Length rules are `.warning()`, never `.error()`: publishing triggers the
 * Vercel deploy hook, so a blocking validation error on a 62-character title
 * would stop the whole site from rebuilding over a nitpick.
 */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description:
        'The page name in search results and the browser tab. " | Cogdell Law" is added automatically, so don\'t type it. Leave empty to use the page\'s normal title.',
      validation: (rule) =>
        rule.max(60).warning("Titles over ~60 characters get truncated in search results."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      description:
        "The summary under the title in search results. Leave empty to use the page's existing opening line.",
      validation: (rule) =>
        rule
          .max(160)
          .warning("Descriptions over ~160 characters get truncated in search results."),
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      description:
        "Only needed when this page duplicates another one — point it at the version search engines should rank. Leave empty and the page points at itself.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description:
        "Keeps this page out of Google and out of sitemap.xml. The page stays live and reachable by link.",
      initialValue: false,
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description:
        "Shown when the page is shared on Facebook, LinkedIn or X. 1200×630 works best. Leave empty to use the site-wide default from Firm Details.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "metaTitle", noIndex: "noIndex" },
    prepare({ title, noIndex }) {
      return {
        title: title || "SEO",
        subtitle: noIndex ? "Hidden from search engines" : undefined,
      };
    },
  },
});
