// News / "In the News" — the firm's press page. Hybrid model: an item either
// links out to an external outlet (a press mention) or, when it carries an owned
// `body` and no `externalUrl`, generates a real /news/[slug] detail page. Today
// every item is an external press mention, so no detail pages build yet.
//
// Static-first (hardcoded here, can move to Sanity later). Array order is the
// display order (the firm's curation); no per-entry dates are shown on the source.

import type { ImageMetadata } from "astro";
import type { Block } from "./practice-areas";

export type NewsMedia = "article" | "video" | "podcast";

export interface NewsItem {
  slug: string; // stable key; path segment for owned posts
  outlet: string; // e.g. "Texas Tribune", "Associated Press", "KHOU"
  outletLogo?: ImageMetadata; // optional press logo; text badge when omitted
  title: string; // clean headline (outlet prefix stripped)
  media: NewsMedia; // drives the media tag + default action verb
  summary: string; // firm-authored blurb
  externalUrl?: string; // present → card links out (new tab); no detail page
  ctaLabel?: string; // optional action override, e.g. "Watch on YouTube"
  body?: Block[]; // present & no externalUrl → owned /news/[slug]
  featured?: boolean;
}

export const news: NewsItem[] = [
  {
    slug: "khou-len-cannon-paxton-interview",
    outlet: "KHOU",
    title: "Len Cannon Speaks One-on-One With Paxton Lawyer Dan Cogdell",
    media: "video",
    summary:
      "Dan Cogdell discusses the challenges faced in the high-profile case of Texas Attorney General Ken Paxton. He shares insights into the courtroom dynamics and the defense approach.",
    externalUrl:
      "https://www.khou.com/video/news/local/len-cannon-speaks-one-on-one-with-paxton-lawyer-dan-cogdell/285-6ee66e01-357f-40ec-9ae7-1a34eba79703",
    ctaLabel: "Watch the interview",
    featured: true,
  },
  {
    slug: "kprc-houston-forensic-science-center",
    outlet: "KPRC",
    title:
      "Criminal Defense Attorneys Give Their Perspective on Houston Forensic Science Center Issue",
    media: "article",
    summary:
      "Houston attorneys, including Anthony Osso, weigh in on the controversies surrounding the Houston Forensic Science Center. They discuss the implications for ongoing and future cases.",
    externalUrl:
      "https://www.click2houston.com/news/local/2024/04/19/criminal-defense-attorneys-give-their-perspective-on-houston-forensic-science-center-issue/",
  },
  {
    slug: "texas-tribune-securities-fraud-jail-time",
    outlet: "Texas Tribune",
    title:
      "Legal Experts Say It's Rare to Pursue Jail Time in Securities Fraud Cases Like Paxton's",
    media: "article",
    summary:
      "Texas legal figures, including Dan Cogdell, explain why jail time is rare in securities fraud cases and provide insights on the legal precedents and implications for Ken Paxton's case.",
    externalUrl:
      "https://www.texastribune.org/2024/03/26/ken-paxton-securities-fraud-case/",
  },
  {
    slug: "ap-paxton-legal-political-victory",
    outlet: "Associated Press",
    title: "Huge Legal and Political Victory for Ken Paxton",
    media: "article",
    summary:
      "Ken Paxton's acquittal is seen as a significant legal and political win. Dan Cogdell explains the reason for this outcome.",
    externalUrl:
      "https://apnews.com/article/ken-paxton-texas-securities-fraud-9ed5eecc30c1f967ec51f7e58ad9d0af",
  },
  {
    slug: "dirty-verdict-podcast-episode-64",
    outlet: "The Dirty Verdict Podcast",
    title: "Episode 64: Dan Cogdell on a Life in Criminal Defense",
    media: "podcast",
    summary:
      "Dan Cogdell discusses the beginnings of his legal career and the intricacies of criminal defense law, offering a behind-the-scenes look at the courtroom battles he has fought.",
    externalUrl: "https://www.youtube.com/watch?v=eSRB63yCVM0",
    ctaLabel: "Watch the interview",
  },
  {
    slug: "ny-post-texas-father-sentenced",
    outlet: "New York Post",
    title:
      "A Texas Father Sentenced to 10 Years in Prison for Fatally Shooting His Wife",
    media: "article",
    summary:
      "The article covers the sentencing of a Texas father, with Anthony Osso providing defense. Osso describes his legal strategy and the challenges he faced representing the client.",
    externalUrl:
      "https://nypost.com/2024/03/08/us-news/texas-man-sentenced-to-10-years-for-shooting-wife-dead-on-camera/",
  },
  {
    slug: "law-crime-texas-father-parole",
    outlet: "Law & Crime",
    title:
      "Texas Father Will Be Eligible for Parole in Five Years After Fatally Shooting His Wife",
    media: "video",
    summary:
      "Attorneys Anthony Osso and Dan Cogdell provide insights into the parole eligibility of a Texas father convicted of murder.",
    externalUrl: "https://www.youtube.com/watch?v=1An-JDNY-QY",
    ctaLabel: "Watch on YouTube",
  },
  {
    slug: "upstream-exxonmobil-executive-cleared",
    outlet: "Upstream",
    title: "Former ExxonMobil Executive Cleared of Sexual Assault Charges",
    media: "article",
    summary:
      "Dan Cogdell successfully defended a former ExxonMobil executive against sexual assault charges. The article details the case and its resolution.",
    externalUrl:
      "https://www.upstreamonline.com/people/former-exxonmobil-executive-cleared-of-sexual-assault-charges/2-1-1610264",
  },
  {
    slug: "usa-today-texas-attorney-sentenced",
    outlet: "USA Today",
    title:
      "Texas Attorney Sentenced to 6 Months in Alleged Abortion Attempt of Wife's Baby",
    media: "article",
    summary:
      "A Texas attorney was sentenced for attempting to abort his unborn child. Dan Cogdell's defense efforts are highlighted in this article.",
    externalUrl:
      "https://www.usatoday.com/story/news/nation/2024/02/08/texas-man-wife-abortion-drugs/72531081007/",
  },
  {
    slug: "lawdragon-waco-trial-cult-leader",
    outlet: "Lawdragon",
    title: "Representing a “Cult” Leader: Dan Cogdell on the Waco Trial",
    media: "article",
    summary:
      "Dan Cogdell reflects on his experience defending Branch Davidian member Clive Doyle in concurrence with the premiere of a Showtime series about the trial. He shares his thoughts on the legal and personal challenges of the case.",
    externalUrl:
      "https://www.lawdragon.com/lawyer-limelights/2023-04-17-representing-a-cult-leader-dan-cogdell-on-the-waco-trial",
  },
  {
    slug: "wfaa-paxton-acquitted-statements",
    outlet: "WFAA",
    title:
      "Paxton Trial: Defense Attorneys Provide Statements After Paxton Acquitted on Impeachment Charges",
    media: "video",
    summary:
      "Following Ken Paxton's acquittal, Dan Cogdell and other defense attorneys share their statements and reflections on the trial.",
    externalUrl: "https://www.youtube.com/watch?v=tp8IidBE8NI",
    ctaLabel: "Watch on YouTube",
  },
  {
    slug: "texas-lawbook-hollywood-treatment",
    outlet: "The Texas Lawbook",
    title:
      "Prominent Texas Criminal Defense Attorney Gets the Hollywood Treatment",
    media: "article",
    summary:
      "Dan Cogdell's representation of Branch Davidian cult member Clive Doyle was portrayed in a five-part Showtime series that premiered in 2023. In a Q&A, Cogdell discusses representing Doyle and his strategy for securing an acquittal.",
    externalUrl:
      "https://texaslawbook.net/prominent-texas-criminal-defense-attorney-gets-the-hollywood-treatment/",
  },
];

// ---- Helpers ----

export interface NewsPathEntry {
  params: { slug: string };
  props: { item: NewsItem };
}

// Only owned posts (an article body, no external link) get their own page.
export function getNewsPaths(): NewsPathEntry[] {
  return news
    .filter((n) => n.body && n.body.length > 0 && !n.externalUrl)
    .map((n) => ({ params: { slug: n.slug }, props: { item: n } }));
}

// The homepage "From the Firm" band shows the most recent handful.
export const latestNews = news.slice(0, 4);
