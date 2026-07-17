// Primary navigation tree — mirrors the current cogdell-law.com site structure.
// Paths match the existing site (trailing slashes dropped) so we can wire up
// matching routes / redirects later. An item with no `href` is a toggle-only
// parent (a grouping label that only opens its submenu).
//
// The structure lives in code; the taxonomy branches (Attorneys, Practice
// Areas, Areas We Serve) are generated from Sanity so the nav and the pages
// stay in sync — add/reorder a document in the Studio and it shows up here too
// (D5). Fetch the tree with `await getNavItems()`; the pure active-trail helpers
// below take a built tree and don't touch Sanity.

import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

// ---- Active-trail helpers (shared by desktop MenuList + mobile drawer) ----

/** Normalize a path for comparison — drop a trailing slash, keep "/" for root. */
export const normalizePath = (path: string) => path.replace(/\/$/, "") || "/";

/** Exact match of an item's href against the (already normalized) current path. */
export const pathMatches = (href: string | undefined, current: string) =>
  !!href && normalizePath(href) === current;

/**
 * True when `current` sits at or beneath a non-root href stem (segment-aware, so
 * `/practice-areas` matches `/practice-areas/x/y` but never `/practice-areas-x`).
 * Lets deep pages (e.g. sub-topics not enumerated in the nav) highlight their
 * ancestor. The root `/` is excluded so Home doesn't match every page.
 */
export const isUnder = (href: string | undefined, current: string) => {
  if (!href) return false;
  const h = normalizePath(href);
  return h !== "/" && (current === h || current.startsWith(h + "/"));
};

/**
 * An item is on the "active trail" if it — or any descendant — is the current
 * page. Highlights the current item and all of its ancestors, even when child
 * URLs don't share the parent's path stem (e.g. /attorney/* → Attorneys), and
 * via `isUnder` for deep pages under a stem (e.g. /practice-areas/*).
 */
export const isOnTrail = (item: NavItem, current: string): boolean =>
  pathMatches(item.href, current) ||
  isUnder(item.href, current) ||
  (item.children?.some((child) => isOnTrail(child, current)) ?? false);

// ---- Taxonomy branches, generated from Sanity (D5) ----

// Slim projections — just what the menus render. Each type is drag-ordered in
// the Studio (D2), so `order(orderRank)` fixes the menu order.

const ATTORNEYS_NAV_QUERY = defineQuery(`*[_type == "attorney"] | order(orderRank){
  "label": name,
  "slug": slug.current
}`);

const PRACTICE_AREAS_NAV_QUERY = defineQuery(`*[_type == "practiceArea"] | order(orderRank){
  _id,
  title,
  "slug": slug.current,
  "parentId": parent._ref
}`);

// Cities are grouping labels (no page of their own); each carries its ordered
// location pages inline.
const AREAS_WE_SERVE_NAV_QUERY = defineQuery(`*[_type == "serviceCity"] | order(orderRank){
  "city": city,
  "citySlug": citySlug.current,
  "pages": *[_type == "locationPage" && references(^._id)] | order(orderRank){
    "navLabel": navLabel,
    "slug": slug.current
  }
}`);

/** Attorneys submenu — bio pages under /attorney/*. */
async function getAttorneysNav(): Promise<NavItem> {
  const attorneys = (await sanityClient.fetch(ATTORNEYS_NAV_QUERY)) ?? [];
  return {
    label: "Attorneys",
    href: "/attorneys",
    children: attorneys.map((a) => ({
      label: a.label!,
      href: `/attorney/${a.slug}`,
    })),
  };
}

/**
 * Practice Areas submenu — the flat `practiceArea` docs rebuilt into their
 * two-level tree via the self-referencing `parent` ref (D1). Order is preserved
 * because the query is already ranked and we filter it in place.
 */
async function getPracticeAreasNav(): Promise<NavItem> {
  const areas = (await sanityClient.fetch(PRACTICE_AREAS_NAV_QUERY)) ?? [];
  const childrenOf = (parentId: string | null) =>
    areas.filter((a) => (a.parentId ?? null) === parentId);

  return {
    label: "Practice Areas",
    href: "/practice-areas",
    children: childrenOf(null).map((area): NavItem => {
      const item: NavItem = {
        label: area.title!,
        href: `/practice-areas/${area.slug}`,
      };
      const kids = childrenOf(area._id);
      if (kids.length) {
        item.children = kids.map((child) => ({
          label: child.title!,
          href: `/practice-areas/${area.slug}/${child.slug}`,
        }));
      }
      return item;
    }),
  };
}

/**
 * Areas We Serve submenu — cities are grouping labels (no href) that open a
 * submenu of their location pages.
 */
async function getAreasWeServeNav(): Promise<NavItem> {
  const cities = (await sanityClient.fetch(AREAS_WE_SERVE_NAV_QUERY)) ?? [];
  return {
    label: "Areas We Serve",
    children: cities.map((city): NavItem => ({
      label: city.city!,
      children: (city.pages ?? []).map((page) => ({
        label: page.navLabel!,
        href: `/${city.citySlug}/${page.slug}`,
      })),
    })),
  };
}

/** The full primary-nav tree. Fetches the taxonomy branches in parallel. */
export async function getNavItems(): Promise<NavItem[]> {
  const [attorneysNav, practiceAreasNav, areasWeServeNav] = await Promise.all([
    getAttorneysNav(),
    getPracticeAreasNav(),
    getAreasWeServeNav(),
  ]);

  return [
    { label: "Home", href: "/" },
    attorneysNav,
    {
      label: "Our Firm",
      href: "/our-firm",
      children: [
        areasWeServeNav,
        { label: "Testimonials", href: "/testimonials" },
        { label: "Videos", href: "/videos" },
      ],
    },
    practiceAreasNav,
    { label: "Trial Experience", href: "/trial-experience" },
    { label: "News", href: "/news" },
    { label: "Contact", href: "/contact" },
  ];
}
