// Blog / news posts — static-first (hardcoded here, can move to Sanity later).
// The homepage "From the Firm" band reads the first as featured + the next three.
// Order in this array is the display order.

export type Post = {
  slug: string; // → future /news/[slug]
  category: string; // e.g. "Federal Defense"
  date: string; // display string, e.g. "June 4, 2026"
  title: string;
  excerpt: string; // featured card + future index cards
  body: string[]; // filler article paragraphs (for a future detail page)
  featured?: boolean;
};

export const posts: Post[] = [
  {
    slug: "understanding-federal-sentencing-guidelines",
    category: "Federal Defense",
    date: "June 4, 2026",
    title: "Understanding Federal Sentencing Guidelines: What Every Defendant Should Know",
    excerpt:
      "Federal sentencing guidelines are complex, but understanding how they work can be critical to your defense strategy. From base offense levels to departure motions, here is what you need to know.",
    featured: true,
    body: [
      "For anyone facing federal charges, the sentencing guidelines are often the single most important — and most misunderstood — part of the process. They are not a rigid formula that dictates a fixed outcome, but they do establish the framework a judge starts from, and understanding that framework early can change the entire arc of a case.",
      "Every offense carries a base offense level, which is then adjusted up or down for specific characteristics: the amount of money involved, the defendant's role, whether a weapon was present, and whether the defendant accepted responsibility. Those adjustments, combined with the defendant's criminal history category, produce a recommended sentencing range.",
      "What many people do not realize is how much room there is to advocate within that structure. Skilled counsel can challenge how loss amounts were calculated, argue for a mitigating-role reduction, and marshal evidence of acceptance of responsibility long before a sentencing hearing is on the calendar.",
      "Beyond the guidelines themselves lies the world of departure and variance motions. A well-supported motion — grounded in a defendant's history, character, and the specific circumstances of the offense — can persuade a court to sentence below the calculated range. These arguments are most effective when they are built from the very first client meeting, not assembled at the last minute.",
      "The guidelines are advisory, but they are influential. The defendants who fare best are the ones whose lawyers understood the numbers from day one and worked, methodically, to move them.",
    ],
  },
  {
    slug: "sec-enforcement-trends",
    category: "White Collar",
    date: "May 19, 2026",
    title: "SEC Enforcement Trends: Protecting Your Business in a Shifting Regulatory Landscape",
    excerpt:
      "Regulators are moving faster and reaching further than ever before. Knowing how an SEC inquiry begins — and how to respond in the first days — is often what separates a manageable matter from a crisis.",
    body: [
      "The Securities and Exchange Commission has sharpened both its priorities and its tools in recent years, and businesses that once considered themselves outside the agency's focus are increasingly finding themselves the subject of inquiries.",
      "Most enforcement matters do not begin with a lawsuit. They begin quietly — a document request, an informal call, a whistleblower tip — and how a company responds in those first days frequently shapes everything that follows.",
      "The instinct to cooperate fully and immediately is understandable, but cooperation without strategy can expose a company to risks it never saw coming. Preserving documents, controlling the narrative, and understanding exactly what the agency is looking for are all decisions that benefit from experienced counsel.",
      "We work with executives, boards, and compliance teams to respond to SEC scrutiny with discipline: mapping exposure, managing communications, and, where appropriate, telling the company's story before the government finishes writing its own.",
    ],
  },
  {
    slug: "art-of-cross-examination",
    category: "Trial Strategy",
    date: "April 28, 2026",
    title: "The Art of Cross-Examination: Lessons from Four Decades in Federal Court",
    excerpt:
      "Cross-examination is where cases are won and lost. After forty years in federal courtrooms, a few principles hold true — preparation beats theatrics, and control matters more than volume.",
    body: [
      "There is a myth that cross-examination is about the dramatic gotcha moment — the single question that shatters a witness. In reality, effective cross is quiet, methodical, and built on preparation that began long before anyone took the stand.",
      "The goal is control. A good cross-examiner asks short, leading questions that permit only one answer, and never asks a question they do not already know the answer to. Every question is a step toward a point the jury will remember in closing.",
      "Just as important is knowing when to stop. The temptation to press for one more concession has undone more cross-examinations than any hostile witness. Discipline — the willingness to sit down when the point is made — is a skill that takes years to learn.",
      "Four decades of federal trials teach a simple lesson: the lawyer who has read every document, anticipated every answer, and rehearsed every sequence will almost always outperform the one relying on instinct alone.",
    ],
  },
  {
    slug: "fifth-circuit-procedural-rights-ruling",
    category: "Legal Updates",
    date: "April 2, 2026",
    title: "Fifth Circuit Ruling Reshapes Procedural Rights in Multi-Defendant Federal Cases",
    excerpt:
      "A recent Fifth Circuit decision changes how courts handle severance and shared discovery in complex multi-defendant prosecutions — with real consequences for anyone charged alongside others.",
    body: [
      "A recent decision from the Fifth Circuit Court of Appeals has meaningful implications for defendants charged in large, multi-defendant federal cases, particularly around when a defendant is entitled to a separate trial.",
      "In sprawling conspiracy prosecutions, the government often tries defendants together, arguing that a single trial is more efficient. But joint trials can prejudice individual defendants, whose conduct may be minor compared to co-defendants the jury hears about at length.",
      "The court's ruling refines the standard for severance and clarifies how shared discovery must be handled when defendants have divergent interests. For defense lawyers, it opens new arguments for separating a client's case from the crowd.",
      "We are already applying the decision in active matters — filing motions that, until recently, would have faced longer odds. When the law shifts, the defendants who benefit are the ones whose lawyers are paying attention.",
    ],
  },
];
