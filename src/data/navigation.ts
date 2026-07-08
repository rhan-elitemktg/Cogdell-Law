// Primary navigation tree — mirrors the current cogdell-law.com site structure.
// Paths match the existing site (trailing slashes dropped) so we can wire up
// matching routes / redirects later. An item with no `href` is a toggle-only
// parent (a grouping label that only opens its submenu).
//
// Static-first: this lives in code for now; it can move to Sanity later if the
// firm wants CMS-managed navigation.

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
 * An item is on the "active trail" if it — or any descendant — is the current
 * page. Highlights the current item and all of its ancestors, even when child
 * URLs don't share the parent's path stem (e.g. /attorney/* → Attorneys).
 */
export const isOnTrail = (item: NavItem, current: string): boolean =>
  pathMatches(item.href, current) ||
  (item.children?.some((child) => isOnTrail(child, current)) ?? false);

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Attorneys",
    href: "/attorneys",
    children: [
      { label: "Dan L. Cogdell", href: "/attorney/cogdell-dan-l" },
      { label: "Anthony Osso", href: "/attorney/osso-anthony" },
      { label: "Brent E. Newton", href: "/attorney/newton-brent-e" },
    ],
  },
  {
    label: "Our Firm",
    href: "/our-firm",
    children: [
      {
        label: "Areas We Serve",
        children: [
          {
            label: "Beaumont Federal Criminal Defense",
            href: "/beaumont-federal-criminal-defense-attorney",
          },
          {
            label: "Dallas Federal Criminal Defense",
            href: "/dallas-federal-criminal-defense-lawyers",
            children: [
              {
                label: "Dallas Health Care Fraud Defense",
                href: "/dallas-health-care-fraud-defense-lawyer",
              },
            ],
          },
          {
            label: "Fort Worth Federal Criminal Defense",
            href: "/fort-worth-health-care-fraud-defense-lawyer",
          },
          {
            label: "Houston Federal Criminal Defense",
            href: "/houston-healthcare-fraud-defense-law-office",
          },
          {
            label: "Sherman Federal Criminal Defense",
            href: "/sherman-federal-criminal-defense-lawyers",
          },
        ],
      },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Videos", href: "/videos" },
    ],
  },
  {
    label: "Practice Areas",
    href: "/practice-areas",
    children: [
      {
        label: "Federal Criminal Cases",
        href: "/practice-areas/federal-criminal-cases",
      },
      {
        label: "Federal Crimes Investigations",
        href: "/practice-areas/federal-criminal-cases/federal-crimes-investigations",
      },
      {
        label: "Fraud & White Collar Crimes",
        href: "/practice-areas/fraud-white-collar-crimes",
      },
      { label: "Health Care Fraud Defense", href: "/health-care-fraud-defense" },
    ],
  },
  { label: "Trial Experience", href: "/trial-experience" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];
