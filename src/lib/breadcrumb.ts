// Shared breadcrumb-trail type. The practice-area and location-page path
// builders (src/sanity/lib) produce `trail: Crumb[]`, which today feeds only
// `breadcrumbSchema()` in src/lib/schema.ts — the visible crumbs were replaced
// by the rail panel. Kept out of the Sanity layer because the shape isn't
// Sanity-specific and both route families build it.
export interface Crumb {
  title: string;
  href?: string; // omitted for grouping labels with no page (e.g. a city)
}
