import type { SchemaTypeDefinition } from "sanity";
import { firmDetails } from "./firmDetails";
import { homePage } from "./homePage";
import { trialExperiencePage } from "./trialExperiencePage";
import { testimonialsPage } from "./testimonialsPage";
import { attorneysPage } from "./attorneysPage";
import { ctaBar } from "./ctaBar";
import { consult } from "./consult";
import { contactPage } from "./contactPage";
import { ourFirmPage } from "./ourFirmPage";
import { videosPage } from "./videosPage";
import { newsPage } from "./newsPage";
import { practiceAreasPage } from "./practiceAreasPage";
import { video } from "./video";
import { attorney } from "./attorney";
import { faq } from "./faq";
import { newsItem } from "./newsItem";
import { legalPage } from "./legalPage";
import { practiceArea } from "./practiceArea";
import { serviceCity } from "./serviceCity";
import { locationPage } from "./locationPage";
import { testimonial } from "./testimonial";
import { trialResult } from "./trialResult";
import { ctaButton } from "./ctaButton";
import { sellingPoint } from "./sellingPoint";
import { practiceAreaCard } from "./practiceAreaCard";
import { practiceAreasBand } from "./practiceAreasBand";
import { attorneysBand } from "./attorneysBand";
import { testimonialsBand } from "./testimonialsBand";
import { testimonialsWallBand } from "./testimonialsWallBand";
import { whyChooseFeature } from "./whyChooseFeature";
import { whyChooseBand } from "./whyChooseBand";
import { practiceReachStat } from "./practiceReachStat";
import { pressLogo } from "./pressLogo";
import { pageHero } from "./pageHero";
import { faqBand } from "./faqBand";
import { newsBand } from "./newsBand";
import { ctaBarContent } from "./ctaBarContent";
import { consultContent } from "./consultContent";
import { educationEntry } from "./educationEntry";
import { trialResultList } from "./trialResultList";
import { seo } from "./seo";
import { accentText } from "./accentText";
import { blockContent } from "./blockContent";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  firmDetails,
  homePage,
  trialExperiencePage,
  testimonialsPage,
  attorneysPage,
  contactPage,
  ourFirmPage,
  videosPage,
  newsPage,
  practiceAreasPage,
  ctaBar,
  consult,
  // Documents
  video,
  trialResult,
  attorney,
  testimonial,
  faq,
  newsItem,
  legalPage,
  practiceArea,
  serviceCity,
  locationPage,
  // Objects
  ctaButton,
  sellingPoint,
  practiceAreaCard,
  practiceAreasBand,
  attorneysBand,
  testimonialsBand,
  testimonialsWallBand,
  whyChooseFeature,
  whyChooseBand,
  practiceReachStat,
  pressLogo,
  pageHero,
  faqBand,
  newsBand,
  ctaBarContent,
  consultContent,
  educationEntry,
  trialResultList,
  seo, // per-page search metadata — attached to every routed document (D15)
  // Rich text
  blockContent, // the standard for body copy — use this by default
  accentText, // deliberate exception: the About pull quote only
];
