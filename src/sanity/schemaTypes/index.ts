import type { SchemaTypeDefinition } from "sanity";
import { firmDetails } from "./firmDetails";
import { homePage } from "./homePage";
import { trialExperiencePage } from "./trialExperiencePage";
import { testimonialsPage } from "./testimonialsPage";
import { video } from "./video";
import { trialResult } from "./trialResult";
import { ctaButton } from "./ctaButton";
import { sellingPoint } from "./sellingPoint";
import { practiceAreaCard } from "./practiceAreaCard";
import { practiceAreasBand } from "./practiceAreasBand";
import { trialResultList } from "./trialResultList";
import { accentText } from "./accentText";
import { blockContent } from "./blockContent";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  firmDetails,
  homePage,
  trialExperiencePage,
  testimonialsPage,
  // Documents
  video,
  trialResult,
  // Objects
  ctaButton,
  sellingPoint,
  practiceAreaCard,
  practiceAreasBand,
  trialResultList,
  // Rich text
  blockContent, // the standard for body copy — use this by default
  accentText, // deliberate exception: the About pull quote only
];
