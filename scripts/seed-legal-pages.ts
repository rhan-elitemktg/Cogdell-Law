/**
 * Seeds the Privacy Policy and Disclaimer legal pages from the hardcoded content
 * in privacy.astro / disclaimer.astro (Block[] → blockContent via the converter).
 *
 *   npx sanity exec scripts/seed-legal-pages.ts --with-user-token
 *
 * Singletons with fixed ids. setIfMissing, so it won't clobber Studio edits.
 */
import { getCliClient } from "sanity/cli";
import { toBlockContent } from "./lib/blockToPortableText";
import type { Block, Section } from "./lib/blockToPortableText";

const client = getCliClient();

// --- content lifted verbatim from the page files ---

const PRIVACY_INTRO: Block[] = [
  { p: "Our law firm recognizes and respects your privacy. We want you to make the most of this website and to feel confident while doing so. The following discloses the information collection, use, and disclosure practices for this domain. This policy does not address information obtained offline." },
];
const PRIVACY_SECTIONS: Section[] = [
  { heading: "What Personal Information Do We Collect?", blocks: [
    { p: "When you visit the public area of this website, you remain anonymous. To the extent you use forms, chats, and e-mail links via the website, or call us via phone to communicate with us or anyone affiliated with us and provide us with personally identifiable information, however, you will not remain anonymous. Because it is impossible to predict every conceivable context in which such information might be provided to us via e-mail, we can provide you no assurance that personally identifiable information you choose to provide to us via e-mail will be maintained as private." },
    { p: "This website uses “cookies.” Cookies are small text files that are placed on a visitor's computer hard drive that allow us and/or the host of this website to record how many times a user or computers within a user's network of computers has visited the website, the number of times various pages of the website have been accessed and to track the user's home page customization preferences. You may disable receipt of cookies using features of your web browser that disable or turn off cookies. We do not use cookies to retrieve information that is unrelated to your visit to or your interaction with this website." },
    { p: "We collect your Internet Protocol (IP) address. An IP address is a number that is assigned to your computer when you use the Internet. The IP address data that we collect do not contain any personally identifiable information about you and is used to administer our site, to determine the numbers of different visitors to the website, and to gather demographic data. However, when you submit information via this website, that information becomes identifiable and is kept on record as having come from your IP address. This information may be used to identify you on subsequent visits to this site, and to other sites associated with it, and to personalize your user experience." },
    { p: "The non-personally identifiable data that this website collects is accessible by certain firm personnel, as well as certain third-party website designers and personnel involved with the third-party service that hosts the website. We use all non-personally identifiable data that we collect internally and together with our website designer and host in order to improve the website. The information is used, for example, to evaluate what portions of the website are more popular than others, to determine where visitors to the site came from, and to determine how many times and how often particular pages of the site were accessed. We may use the data to prepare reports regarding website activity as part of the process of maintaining and improving the site." },
  ]},
  { heading: "What Steps Do We Take to Protect Your Privacy?", blocks: [
    { p: "To the extent permitted by law, we will not sell, share, or otherwise disclose any of the information collected online without your express permission." },
  ]},
  { heading: "What Are the Privacy Policies of Sites to Which This Website Links?", blocks: [
    { p: "We provide links to third party websites that we do not control. Therefore, we urge you to review the privacy policies posted on these third party websites at the time you first visit such sites. We assume no obligation to review or ensure enforcement or compliance with the privacy policy of any website to which we link." },
  ]},
  { heading: "What About Children's Privacy?", blocks: [
    { p: "We do not knowingly collect personally identifiable information from any children under age 13." },
  ]},
  { heading: "Is Data Storage and Processing Conducted in the United States?", blocks: [
    { p: "Regardless of where you are located, the site collects information and processes and stores that information in databases located in the United States." },
  ]},
  { heading: "Can We Revise This Privacy Policy?", blocks: [
    { p: "Due to the rapidly evolving technologies on the Internet, we may occasionally update this privacy policy. All revisions will be posted here. We therefore urge you to review this Privacy Policy frequently." },
  ]},
  { heading: "What If I Have Questions About This Privacy Policy?", blocks: [
    { p: "Our firm welcomes questions and comments about this website and about this policy. You are welcome to call us with your comments and questions at the number listed on this page." },
  ]},
];

const DISCLAIMER_INTRO: Block[] = [
  { p: "The information you obtain at this site is not, nor is it intended to be, legal advice. You should consult an attorney for advice regarding your individual situation. We invite you to contact us and welcome your calls, letters and electronic mail. Contacting us does not create an attorney-client relationship. Please do not send any confidential information to us until such time as an attorney-client relationship has been established." },
];

const PAGES = [
  { id: "privacy", title: "Privacy Policy", intro: PRIVACY_INTRO, sections: PRIVACY_SECTIONS },
  { id: "disclaimer", title: "Disclaimer", intro: DISCLAIMER_INTRO, sections: [] as Section[] },
];

async function main() {
  console.log(`Seeding legal pages into "${client.config().dataset}"…`);
  for (const page of PAGES) {
    await client.createIfNotExists({ _id: page.id, _type: "legalPage" });
    await client
      .patch(page.id)
      .setIfMissing({
        title: page.title,
        body: toBlockContent({ intro: page.intro, sections: page.sections }, page.id),
      })
      .commit();
    console.log(`  ${page.title}: ${page.sections.length} sections`);
  }
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
