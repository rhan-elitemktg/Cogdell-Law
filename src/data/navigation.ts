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
 * ancestor. The root `/` is excluded so a home link can't match every page.
 */
export const isUnder = (href: string | undefined, current: string) => {
  if (!href) return false;
  const h = normalizePath(href);
  return h !== "/" && (current === h || current.startsWith(h + "/"));
};

/**
 * An item is on the "active trail" if it — or any descendant — is the current
 * page. Highlights the current item and all of its ancestors, even when child
 * URLs don't share the parent's path stem (e.g. /our-team/* → Our Team), and
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
  "slug": slug.current,
  "group": teamGroup
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

/**
 * Our Team submenu — bio pages under /our-team/*, split into Attorneys and
 * Paralegals.
 *
 * The document type is still `attorney` and the bio route is still
 * /our-team/{slug} now; the landing page is /our-team, so the menu can
 * cover paralegals and staff as well as attorneys.
 *
 * The two headings are grouping labels with no href of their own — the same
 * shape Areas We Serve uses for its cities, so MenuList and the mobile drawer
 * already render them as toggle-only rows. Order within each group is the
 * Studio's drag order, since the query is ranked and filtered in place.
 */
/**
 * Both forms of each heading, because the group is headed by however many people
 * are actually in it — "Paralegal" while Laken is the only one, "Paralegals" the
 * day a second is hired, with no code change either time. A fixed plural is the
 * F17 trap in miniature: correct for exactly today's roster, wrong silently
 * afterwards, and nobody notices because nothing errors.
 */
const TEAM_GROUPS = [
  { key: "attorney", singular: "Attorney", plural: "Attorneys" },
  { key: "paralegal", singular: "Paralegal", plural: "Paralegals" },
] as const;

async function getAttorneysNav(): Promise<NavItem> {
  const people = (await sanityClient.fetch(ATTORNEYS_NAV_QUERY)) ?? [];

  return {
    label: "Our Team",
    href: "/our-team",
    // flatMap so a group with nobody in it disappears rather than rendering an
    // empty heading that opens onto nothing.
    children: TEAM_GROUPS.flatMap(({ key, singular, plural }): NavItem[] => {
      // Default to `attorney` so a document saved before `teamGroup` existed
      // still appears somewhere instead of dropping out of the menu.
      const members = people.filter((p) => (p.group ?? "attorney") === key);
      if (!members.length) return [];
      return [
        {
          label: members.length === 1 ? singular : plural,
          children: members.map((p) => ({
            label: p.label!,
            href: `/our-team/${p.slug}`,
          })),
        },
      ];
    }),
  };
}

/**
 * Practice Areas submenu — the flat `practiceArea` docs rebuilt into their
 * two-level tree via the self-referencing `parent` ref (D1). Order is preserved
 * because the query is already ranked and we filter it in place.
 *
 * Exported because the practice-area sidebar renders the same tree the header
 * menu does — one source, so the rail can never drift from the nav.
 */
export async function getPracticeAreasNav(): Promise<NavItem> {
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
 *
 * Exported for the location-page sidebar, the same way getPracticeAreasNav is.
 * Note the shape difference the rail has to cope with: these parents carry no
 * `href`, so their label is plain text rather than a link.
 */
export async function getAreasWeServeNav(): Promise<NavItem> {
  const cities = (await sanityClient.fetch(AREAS_WE_SERVE_NAV_QUERY)) ?? [];
  return {
    label: "Areas We Frequently Serve",
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
    attorneysNav,
    {
      label: "Our Firm",
      href: "/our-firm",
      children: [
        areasWeServeNav,
        { label: "Testimonials", href: "/testimonials" },
        { label: "Videos", href: "/videos" },
        { label: "News", href: "/news" },
      ],
    },
    practiceAreasNav,
    { label: "Trial Experience", href: "/trial-experience" },
    // Took News's top-level slot when the podcast relaunched on YouTube. The
    // podcast was briefly hidden from the menu entirely (2026-08-14) while it
    // was being rebuilt; this is that entry returning, promoted.
    { label: "Podcasts", href: "/podcast" },
    { label: "Contact", href: "/contact" },
  ];
}
