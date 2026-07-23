import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const PATHS_QUERY = defineQuery(`*[_type == "locationPage"] | order(orderRank){
  _id,
  title,
  navLabel,
  heroTitle,
  lede,
  body,
  faqs[]{ _key, question, answer },
  "slug": slug.current,
  "cityName": city->city,
  "citySlug": city->citySlug.current,
  _updatedAt,
  seo{
    metaTitle,
    metaDescription,
    canonicalUrl,
    noIndex,
    ogImage
  }
}`);

/** { params:{city,slug}, props } for every location page — getStaticPaths. */
export async function getAreaPaths() {
  const pages = (await sanityClient.fetch(PATHS_QUERY)) ?? [];
  return pages.map((p) => ({
    params: { city: p.citySlug!, slug: p.slug! },
    props: {
      page: p,
      cityName: p.cityName,
      trail: [
        { title: "Areas We Serve" },
        { title: p.cityName },
        { title: p.navLabel, href: `/${p.citySlug}/${p.slug}` },
      ],
    },
  }));
}
