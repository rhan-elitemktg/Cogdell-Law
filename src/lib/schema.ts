// Schema.org JSON-LD builders (D15).
//
// Every one of these is derived from content that already exists — Firm Details,
// the breadcrumb trail a page already renders, the FAQs already on the page. No
// editor ever fills in a structured-data field, so the markup can't drift out of
// sync with what the page actually says.
import { toPlainText } from "./portableText";
import type { Crumb } from "./breadcrumb";

/** Firm Details as `getFirmDetails()` projects it — only the parts used here. */
interface FirmDetailsInput {
  title?: string | null;
  tagline?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: { street?: string | null; cityStateZip?: string | null } | null;
  socials?: ({ url?: string | null } | null)[] | null;
}

/** Splits "Houston, TX 77002" into its parts. Returns undefined if it doesn't fit. */
function parseCityStateZip(value?: string | null) {
  const match = value?.trim().match(/^(.+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (!match) return undefined;
  return { city: match[1], state: match[2], postalCode: match[3] };
}

/**
 * The firm itself — emitted once per page from Layout. `LegalService` is the
 * Schema.org type for a law firm; `@id` anchors it so every page refers to the
 * same entity rather than declaring a new one.
 */
export function legalServiceSchema(
  firm: FirmDetailsInput | null | undefined,
  siteUrl: string,
  logoUrl?: string,
) {
  if (!firm) return undefined;

  const parts = parseCityStateZip(firm.address?.cityStateZip);
  const sameAs = (firm.socials ?? [])
    .map((social) => social?.url)
    .filter((url): url is string => !!url);

  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${siteUrl}/#organization`,
    name: firm.title ?? undefined,
    description: firm.tagline ?? undefined,
    url: siteUrl,
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
    ...(firm.phone ? { telephone: firm.phone } : {}),
    ...(firm.email ? { email: firm.email } : {}),
    ...(firm.address?.street
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: firm.address.street,
            ...(parts
              ? {
                  addressLocality: parts.city,
                  addressRegion: parts.state,
                  postalCode: parts.postalCode,
                }
              : {}),
            addressCountry: "US",
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/**
 * The breadcrumb trail, built from the `trail` the Sanity layer already returns
 * for practice areas and location pages.
 *
 * There are no visible crumbs on the site any more — the rail panel replaced
 * them — but the markup is worth keeping: it describes the page's place in the
 * hierarchy for search engines. Home is position 1, because Google expects the
 * list to start at root even when the page shows no trail at all.
 * Crumbs with no href — grouping labels like "Areas We Serve" — get no `item`,
 * which is valid and correctly says "this level has no page".
 */
export function breadcrumbSchema(trail: Crumb[], siteUrl: string) {
  if (!trail?.length) return undefined;

  const entries = [{ title: "Home", href: "/" }, ...trail];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.title,
      ...(crumb.href ? { item: `${siteUrl}${crumb.href}`.replace(/\/+$/, "") } : {}),
    })),
  };
}

interface FaqInput {
  question?: string | null;
  answer?: unknown;
}

/**
 * FAQPage markup for the accordions on practice-area and location pages.
 *
 * Answers are blockContent, so they're flattened to plain text — Google reads
 * `text` as a string and won't accept the block array.
 */
export function faqSchema(faqs: FaqInput[] | null | undefined) {
  const entries = (faqs ?? [])
    .map((faq) => ({ question: faq?.question?.trim(), answer: toPlainText(faq?.answer) }))
    .filter((entry) => entry.question && entry.answer);

  if (!entries.length) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

/**
 * VideoObject for a podcast episode.
 *
 * Most episodes carry little or no show-notes copy, so without this an episode
 * page is a heading, a date and an embed — thin by any measure. The structured
 * data is what tells search engines the page is a video and makes it eligible
 * for video results.
 *
 * `thumbnailUrl` is pure string construction from the id: no fetch, nothing
 * stored, so D8 is satisfied rather than bent. `maxresdefault` exists only for
 * sources uploaded at 720p or better, which every episode on this channel is.
 */
export function videoObjectSchema(input: {
  name: string | null | undefined;
  description: string | null | undefined;
  youtubeId: string | null | undefined;
  uploadDate: string | null | undefined;
  pageUrl: URL;
}) {
  const id = input.youtubeId?.trim();
  if (!input.name || !id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description ?? input.name,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
    url: input.pageUrl.href,
    ...(input.uploadDate ? { uploadDate: input.uploadDate } : {}),
  };
}
