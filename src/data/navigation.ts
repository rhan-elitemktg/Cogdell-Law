// Primary navigation tree — mirrors the current cogdell-law.com site structure.
// Paths match the existing site (trailing slashes dropped) so we can wire up
// matching routes / redirects later. An item with no `href` is a toggle-only
// parent (a grouping label that only opens its submenu).
//
// Static-first: this lives in code for now; it can move to Sanity later if the
// firm wants CMS-managed navigation.

import { practiceAreas } from "./practice-areas";
import { areasWeServe } from "./areas-we-serve";

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

// Practice Areas menu is generated from the practice-areas data so the nav and
// the pages stay in sync — add a sub-topic there and it shows up here too.
const practiceAreasNav: NavItem = {
  label: "Practice Areas",
  href: "/practice-areas",
  children: practiceAreas.map((area): NavItem => {
    const item: NavItem = {
      label: area.title,
      href: `/practice-areas/${area.slug}`,
    };
    if (area.children?.length) {
      item.children = area.children.map((child) => ({
        label: child.title,
        href: `/practice-areas/${area.slug}/${child.slug}`,
      }));
    }
    return item;
  }),
};

// Areas We Serve menu is generated from the location data — cities are grouping
// labels (no href) that open a submenu of their pages.
const areasWeServeNav: NavItem = {
  label: "Areas We Serve",
  children: areasWeServe.map((city): NavItem => ({
    label: city.city,
    children: city.pages.map((page) => ({
      label: page.navLabel,
      href: `/${city.citySlug}/${page.slug}`,
    })),
  })),
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Attorneys",
    href: "/attorneys",
    children: [
      { label: "Dan L. Cogdell", href: "/attorney/cogdell-dan-l" },
      { label: "Aisha J. Dennis", href: "/attorney/dennis-aisha-j" },
      { label: "Anthony Osso", href: "/attorney/osso-anthony" },
      { label: "Brent E. Newton", href: "/attorney/newton-brent-e" },
    ],
  },
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
