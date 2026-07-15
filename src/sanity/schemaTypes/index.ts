import type { SchemaTypeDefinition } from "sanity";
import { firmDetails } from "./firmDetails";
import { homePage } from "./homePage";
import { video } from "./video";
import { ctaButton } from "./ctaButton";
import { sellingPoint } from "./sellingPoint";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  firmDetails,
  homePage,
  // Documents
  video,
  // Objects
  ctaButton,
  sellingPoint,
];
