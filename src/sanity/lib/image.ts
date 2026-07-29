import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const builder = createImageUrlBuilder(sanityClient);

/** Build an optimized image URL from a Sanity image source. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
