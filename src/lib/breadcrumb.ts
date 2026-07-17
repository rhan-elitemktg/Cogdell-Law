// Shared breadcrumb-trail type. The practice-area and location-page path
// builders (src/sanity/lib) produce `trail: Crumb[]`, and `Breadcrumb.astro`
// renders it. Kept here (not in a page or the Sanity layer) because more than
// one route needs it and it's not Sanity-specific.
export interface Crumb {
  title: string;
  href?: string; // omitted for grouping labels with no page (e.g. a city)
}
