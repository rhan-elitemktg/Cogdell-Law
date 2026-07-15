import type { SchemaTypeDefinition } from "sanity";
import { firmDetails } from "./firmDetails";
import { homePage } from "./homePage";
import { trialExperiencePage } from "./trialExperiencePage";
import { testimonialsPage } from "./testimonialsPage";
import { video } from "./video";
import { ctaButton } from "./ctaButton";
import { sellingPoint } from "./sellingPoint";
import { practiceAreaCard } from "./practiceAreaCard";
import { practiceAreasBand } from "./practiceAreasBand";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  firmDetails,
  homePage,
  trialExperiencePage,
  testimonialsPage,
  // Documents
  video,
  // Objects
  ctaButton,
  sellingPoint,
  practiceAreaCard,
  practiceAreasBand,
];
