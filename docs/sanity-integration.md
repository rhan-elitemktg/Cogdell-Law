# Sanity Integration — Progress Tracker

Living tracker for moving Cogdell Law from static content to Sanity. Every page and
component in the site is listed below. Check cells off as we go.

**Guiding rule:** the site works today. Every row must leave `astro build` green and
the rendered page identical. One content type at a time — never a big bang.

## Status — migration complete (2026-07-17)

**The site is fully on Sanity and the publish pipeline is live.** Homepage, all interior
pages, both legal pages, the full practice-area tree (20 pages), all location pages,
videos, news, Firm Details, navigation (Phase 7 / D5), and the Sanity → Vercel deploy
webhook (Phase 9) are all done. Publishing in the Studio now auto-rebuilds and deploys the
live site. Every migrated page verified byte-identical (or, for /our-firm, identical in
visible output — see F21). Safe revert tag: `pre-interior-migration`.

**Only optional follow-up left:** Visual Editing (click-to-edit from the live site) — still
an open question for the firm (§7), deferred.

**2026-07-23 — SEO fields added (D15, §6b).** Every routed document now carries an editable
SEO group (meta title/description, canonical, noindex, share image), and the site ships
`sitemap.xml`, `robots.txt` and Schema.org markup. All fields fall back to today's copy, so the
rendered titles and descriptions are byte-identical until someone edits something.

**Still in code by design:** `data/navigation.ts` (structure only — now async via
`getNavItems()`, taxonomy branches fetched from Sanity), `data/us-states.ts` (SVG map
geometry). ✅ **2026-07-17 — the `src/data` leftovers are gone:** `practice-areas.ts`,
`areas-we-serve.ts` and `videos.ts` were deleted along with their three seed scripts
(`seed-practice-areas-tree`, `seed-areas-we-serve`, `seed-hero`). The one live dependency,
the `Crumb` type, was relocated to `src/lib/breadcrumb.ts` (used by `Breadcrumb.astro` /
`news/[slug].astro`). `scripts/lib/blockToPortableText.ts` stays — it's self-contained and
still used by `seed-legal-pages`.

**Remaining:** Phase 9 **deploy pipeline only** — Vercel env vars + build settings, Sanity
CORS origin for the production domain, and the Sanity publish → Vercel deploy-hook webhook
(F6). Dataset `jk9lqisp/production` is **public** (anonymous read verified), so no read
token or client change is needed. Visual Editing deferred (firm's open question).

## Legend

| Mark | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `—` | Not applicable — no Sanity work needed |

**Column meanings**

- **Schema** — the Sanity type exists and is registered in `schemaTypes/index.ts`
- **Content** — real content imported into the dataset (not just an empty schema)
- **Wired** — the page/component fetches from Sanity; the static import is gone
- **Verified** — `astro build` green **and** the rendered page eyeballed against today's

---

## 1. Content types

The schema layer. Everything in section 2 and 3 depends on these.

| Content type | Source today | Kind | Docs | Schema | Content | Query helper | Phase |
|---|---|---|---|---|---|---|---|
| `firmDetails` | *(already in Sanity)* | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ done |
| `homePage` (hero only) | `Hero.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ done |
| `ctaButton` | `Hero.astro` | object | — | `[x]` | — | `[x]` | ✅ done |
| `sellingPoint` | `SellingPoints.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `homePage.statement` | `StatementBand.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `homePage.firmStory` | `FirmStory.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `ctaBar` + `ctaBarContent` | `CtaBar.astro` | singleton + object | 1 | `[x]` | `[x]` | `[x]` | ✅ done — site-wide, ~43 pages (D13) |
| `consult` + `consultContent` | `Consult.astro` | singleton + object | 1 | `[x]` | `[x]` | `[x]` | ✅ done — ONE shared record, no overrides (D13 amended) |
| `contactPage` | `contact.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ hero; ContactMethods reads firmDetails |
| `ourFirmPage` | `our-firm.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ done — hero, intro, stats, quote, founding, origin, values |
| `videosPage` / `newsPage` / `practiceAreasPage` | those pages | singletons | 3 | `[x]` | `[x]` | `[x]` | ✅ hero + grid headers |
| `practiceAreaCard` | `PracticeAreas.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `practiceAreasBand` | `PracticeAreas.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done — one copy per page (D11) |
| `trialExperiencePage` | `trial-experience.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ hero + bands + trial results |
| `testimonialsPage` | `testimonials.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ hero + bands + wall |
| `video` | ~~`data/videos.ts`~~ | document | 5 | `[x]` | `[x]` | `[x]` | ✅ done — title + `wistiaId`; Wistia supplies poster/duration (D8) |
| `blockContent` (Portable Text) | `Block[]` in `practice-areas.ts` | object | — | `[x]` | `[x]` | `[x]` | ✅ done — **standard for all body copy (D12)**; shared renderers in `components/prose/` (F18) |
| `link` (annotation) | `Inline{text,href}` | object | — | `[x]` | — | `[ ]` | ✅ inside `blockContent`; reference toggle in Phase 5 (D4) |
| `testimonial` | ~~`data/testimonials.ts`~~ | document | 16 | `[x]` | `[x]` | `[x]` | ✅ done — F2 resolved; `featured` toggle, max 3 |
| `testimonialsBand` | `Testimonials.astro` header | object | — | `[x]` | `[x]` | `[x]` | ✅ done — one copy per page (D11) |
| `testimonialsWallBand` | `TestimonialsWall.astro` header | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `whyChooseBand` + `whyChooseFeature` | `WhyChoose.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done — one copy per page (D11) |
| `homePage.practiceReach` + `practiceReachStat` | `PracticeReach.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done — copy only; US map stays in code |
| `homePage.press` + `pressLogo` | `Press.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done — logos in Sanity (D6) |
| `attorney` | ~~`data/attorneys.ts`~~ | document | 4 | `[x]` | `[x]` | `[x]` | ✅ done — F2 resolved; photos in Sanity |
| `educationEntry` | `data/attorneys.ts` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `attorneysBand` | `Attorneys.astro` header | object | — | `[x]` | `[x]` | `[x]` | ✅ done — one copy per page (D11) |
| `attorneysPage` | `attorneys.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ hero + bands |
| `newsItem` | ~~`data/news.ts`~~ | document | 12 | `[x]` | `[x]` | `[x]` | ✅ done — hybrid external/owned; publishedAt override |
| `newsBand` | `News.astro` (was Blog) | object | — | `[x]` | `[x]` | `[x]` | ✅ done — featured ref + 3-newest (F20) |
| `trialResult` | `TrialResults.astro` + `About.astro` | document | 16 | `[x]` | `[x]` | `[x]` | ✅ done — F2 duplicate resolved |
| `trialResultList` | `TrialResults.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `accentText` (Portable Text) | `About.astro` quote | object | — | `[x]` | `[x]` | `[x]` | ✅ done — first PT type |
| `faq` | `Faq.astro` | document | 6 | `[x]` | `[x]` | `[x]` | ✅ done — F1; `blockContent` answers, orderRank |
| `faqBand` | `Faq.astro` header | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `practiceArea` | ~~`data/practice-areas.ts`~~ | document | 20 | `[x]` | `[x]` | `[x]` | ✅ done — self-ref parent (D1); single Body Content (D14) |
| `serviceCity` | ~~`data/areas-we-serve.ts`~~ | document | 5 | `[x]` | `[x]` | `[x]` | ✅ done |
| `locationPage` | ~~`data/areas-we-serve.ts`~~ | document | 6 | `[x]` | `[x]` | `[x]` | ✅ done — single Body Content (D14) |
| `legalPage` | ~~`privacy.astro`, `disclaimer.astro`~~ | singletons | 2 | `[x]` | `[x]` | `[x]` | ✅ done — single Body Content (D14) |
| `firmDetails` *(expanded)* | `Footer.astro` | singleton | 1 | `[x]` | `[x]` | `[x]` | ✅ tagline/email/address/socials + copyright/legal links; footer wired |

⚠️ `trialResult` and `faq` were **not** in the original plan — they're real content
currently buried inside components. See section 4, finding F1.

**Staying in code (by design)**

| What | Why |
|---|---|
| `data/us-states.ts` | SVG path reference data for the map. Never CMS. |
| `data/navigation.ts` | Structure, not content. ✅ Now async (`getNavItems()`) — the taxonomy branches fetch from Sanity; only the top-level order + labels stay in code (D5). |
| `wistiaEmbed()` | Pure URL helper. |
| Design assets (`hero-boardroom`, `whychoose-bg`, `firm-steps`…) | Layout, not content. Keep `astro:assets`. |

---

## 2. Pages

All 16 routes. "Depends on" is the content type(s) the page needs before it can be wired.

| Route | File | Depends on | Schema | Content | Wired | Verified | Phase |
|---|---|---|---|---|---|---|---|
| `/testimonials` | `pages/testimonials.astro` | `testimonial` | `[x]` | `[x]` | `[x]` | `[x]` | ✅ done |
| `/videos` | `pages/videos.astro` | `video` | `[x]` | `[x]` | `[x]` | `[x]` | ✅ done |
| `/attorneys` | `pages/attorneys.astro` | `attorney` | `[x]` | `[x]` | `[x]` | `[x]` | ✅ done |
| `/attorney/[slug]` | `pages/attorney/[slug].astro` | `attorney` | `[x]` | `[x]` | `[x]` | `[x]` | ✅ done — 4 pages |
| `/news` | `pages/news/index.astro` | `newsItem` | `[x]` | `[x]` | `[x]` | `[x]` | ✅ done |
| `/news/[slug]` | `pages/news/[slug].astro` | `newsItem` | `[x]` | `[x]` | `[~]` | `[x]` | wired; 0 owned articles yet |
| `/trial-experience` | `pages/trial-experience.astro` | `trialResult` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 4 |
| `/practice-areas` | `pages/practice-areas/index.astro` | `practiceArea` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 5 |
| `/practice-areas/[...slug]` | `pages/practice-areas/[...slug].astro` | `practiceArea` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 5 |
| `/[city]/[slug]` | `pages/[city]/[slug].astro` | `serviceCity`, `locationPage` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 6 |
| `/` | `pages/index.astro` | *(composition only)* | — | — | `[ ]` | `[ ]` | 1–5 |
| `/our-firm` | `pages/our-firm.astro` | `attorney`, page copy | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 7 |
| `/privacy` | `pages/privacy.astro` | `legalPage` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 8 |
| `/disclaimer` | `pages/disclaimer.astro` | `legalPage` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 8 |
| `/contact` | `pages/contact.astro` | `contactPage`, `firmDetails` | `[x]` | `[x]` | `[~]` | `[x]` | consult done; hero + methods pending |
| `/404` | `pages/404.astro` | — | — | — | — | `[ ]` | — |

`/` is a composition of homepage components — it has no data of its own, so it's done
when its components are (section 3). It touches nearly every phase, so **re-verify the
homepage after each one**.

---

## 3. Components

All 41 components + the layout. Grouped by how much Sanity work each needs.

### 3a. Bound to a content type

| Component | Content source today | Target type | Wired | Verified | Phase |
|---|---|---|---|---|---|
| `TestimonialsWall.astro` | ~~`data/testimonials.ts`~~ | `testimonial` (all) | `[x]` | `[x]` | ✅ done |
| `Testimonials.astro` | ~~own array~~ | `testimonial` (featured ×3) | `[x]` | `[x]` | ✅ done |
| `Hero.astro` | ~~`data/videos.ts`~~ | `homePage.hero` + `video` | `[x]` | `[x]` | ✅ done |
| `SellingPoints.astro` | ~~`defaultPoints`~~ | `homePage.sellingPoints` (via `index.astro`) | `[x]` | `[x]` | ✅ done |
| `StatementBand.astro` *(was `VideoBand`)* | ~~hardcoded copy~~ | `homePage.statement` | `[x]` | `[x]` | ✅ done |
| `CtaBar.astro` | ~~hardcoded copy~~ | `ctaBar` shared + override (D13) | `[x]` | `[x]` | ✅ done — ~43 pages |
| `FirmStory.astro` | ~~hardcoded copy~~ | `homePage.firmStory` | `[x]` | `[x]` | ✅ done |
| `WhyChoose.astro` | ~~own array~~ | `whyChooseBand` ×2 pages | `[x]` | `[x]` | ✅ done |
| `PracticeReach.astro` | ~~hardcoded copy + `us-states.ts`~~ | `homePage.practiceReach` (map stays) | `[x]` | `[x]` | ✅ done |
| `Press.astro` | ~~10 logo imports~~ | `homePage.press` (logos in Sanity) | `[x]` | `[x]` | ✅ done |
| `Faq.astro` | ~~own array~~ | `faq` docs + `homePage.faq` header | `[x]` | `[x]` | ✅ done |
| `Consult.astro` | ~~hardcoded defaults~~ | `consult` shared + override (D13) | `[x]` | `[x]` | ✅ done — 13 callers |
| `video/VideoGrid.astro` | `data/videos.ts` (type) | `video` | `[ ]` | `[ ]` | 2 |
| `video/VideoLightbox.astro` | props | `video` | `[ ]` | `[ ]` | 2 |
| `attorney/AttorneyBio.astro` | ~~`data/attorneys.ts`~~ | `attorney` | `[x]` | `[x]` | ✅ done |
| `attorney/AttorneyHero.astro` | ~~`data/attorneys.ts`~~ | `attorney` | `[x]` | `[x]` | ✅ done |
| `Attorneys.astro` | ~~own array~~ | `attorney` | `[x]` | `[x]` | ✅ done |
| `about/FoundingAttorney.astro` | hardcoded copy | `attorney` | `[ ]` | `[ ]` | 3 |
| `news/NewsGrid.astro` | ~~`data/news.ts`~~ | `newsItem` | `[x]` | `[x]` | ✅ done |
| `News.astro` *(was `Blog`)* | ~~`data/news.ts`~~ | `homePage.news` + `newsItem` | `[x]` | `[x]` | ✅ done |
| `TrialResults.astro` | ~~own array~~ | `trialResult` ×16 | `[x]` | `[x]` | ✅ done |
| `About.astro` | ~~own array~~ | `homePage.about` + `trialResult` ×6 | `[x]` | `[x]` | ✅ done |
| `Faq.astro` | ~~own array~~ | `faq` docs + `homePage.faq` header | `[x]` | `[x]` | ✅ done |
| `practice/Blocks.astro` | `Block`/`Inline` types | → `<PortableText>` | `[ ]` | `[ ]` | 5 |
| `practice/PracticeBody.astro` | `practice-areas.ts` (types) | `practiceArea` | `[ ]` | `[ ]` | 5 |
| `practice/PracticeFaqs.astro` | `practice-areas.ts` (type) | `practiceArea` | `[ ]` | `[ ]` | 5 |
| `practice/Breadcrumb.astro` | `Crumb` type | `practiceArea` | `[ ]` | `[ ]` | 5 |
| `PracticeAreas.astro` | ~~own array~~ | `practiceAreasBand` ×3 pages | `[x]` | `[x]` | ✅ done |
| `Header.astro` | `navigation` + `firmDetails` | nav async | `[x]` | `[x]` | ✅ nav async (D5); `await getNavItems()` |
| `MenuList.astro` | `data/navigation.ts` | nav async | `[x]` | `[x]` | ✅ done — pure presentational, unchanged (helpers stable) |
| `MobileNav.astro` | `data/navigation.ts` | nav async | `[x]` | `[x]` | ✅ done — now takes `items` prop from `Header` (single fetch) |
| `Footer.astro` | `firmDetails` + hardcoded links | `firmDetails` | `[~]` | `[ ]` | 7–8 |
| `ContactMethods.astro` | hardcoded phone/email | `firmDetails` | `[ ]` | `[ ]` | 8 |
| `Press.astro` | ~~10 logo imports~~ | `homePage.press` (logos in Sanity) | `[x]` | `[x]` | ✅ done |
| `Faq.astro` | ~~own array~~ | `faq` docs + `homePage.faq` header | `[x]` | `[x]` | ✅ done |

`Header` / `Footer` are `[~]` — already partly on Sanity (logo, phone) but still hold
hardcoded nav links and socials.

### 3b. Hardcoded marketing copy — needs decision D7

Real content, but design-coupled and rarely changed. Decide per D7 whether it moves.

| Component | Hardcoded content | Wired | Verified |
|---|---|---|---|
| ~~`SellingPoints.astro`~~ | ✅ done — now presentational, see §3a | `[x]` | `[x]` |
| `about/Values.astro` | `values` — 4× icon/title/body | `[ ]` | `[ ]` |
| `about/OriginStory.astro` | `milestones` — timeline | `[ ]` | `[ ]` |
| `about/AboutIntro.astro` | intro copy | `[ ]` | `[ ]` |
| `about/QuoteBand.astro` | pull quote | `[ ]` | `[ ]` |
| `pages/our-firm.astro` | `stats` — 4 stats | `[ ]` | `[ ]` |

### 3c. Presentational — no Sanity work

Props-driven or pure layout. Listed for coverage; nothing to do.

| Component | Why |
|---|---|
| `Eyebrow.astro` | Pure presentation |
| `PageHero.astro` | Props-driven |
| `practice/PracticeGrid.astro` | Props-driven |
| ~~`PracticeReach.astro`~~ | ✅ **copy migrated** (`homePage.practiceReach`); only the US map geometry (`us-states.ts`) stays static |
| `layouts/Layout.astro` | Shell |
| `pages/404.astro` | `quickLinks` are nav, not content |

---

## 4. Findings

Things the code revealed that change the plan. **F1 and F2 need firm input.**

### F1 — Content is hiding inside components ⚠️

The six `data/*.ts` files are **not** the whole content surface. Roughly a dozen
components carry their own hardcoded arrays, and two of them are substantial content
that will keep growing:

- `TrialResults.astro` — ~12 real case write-ups (Paxton, Enron, Waco). This is the
  firm's marquee content and it lives in a component.
- `Faq.astro` — ~6 long-form Q&As.

Both should become real document types. That's the `trialResult` / `faq` rows above.

### F2 — Three components duplicate the data files, and have drifted ⚠️

Not near-duplicates — **actually different content**:

| Component | Its content | The data file | Verdict |
|---|---|---|---|
| ~~`Attorneys.astro`~~ | 4 attorneys, `"Founding Attorney"` | `attorneys.ts` says `"Principal & Founder"` | ✅ **resolved 2026-07-15** — see F15 |
| ~~`Testimonials.astro`~~ | 3 quotes, all `"Former Client"` + `tag` | `testimonials.ts` has 16, initials, no tags | ✅ **resolved 2026-07-15** — see F19 |
| ~~`PracticeAreas.astro`~~ | Complex Civil Litigation, Personal Injury, Government Investigations… | Health Care Fraud, Federal Criminal Cases, Fraud & White Collar, Appeals | ✅ resolved — see update below |
| ~~`About.astro`~~ | `results` — Enron, Waco | overlaps `TrialResults.astro`'s cases | ✅ **resolved 2026-07-15** — see F13 |

The homepage practice grid advertises services (civil litigation, personal injury) that
**don't exist in the practice-areas tree at all**. Either the homepage is aspirational
or the tree is incomplete — that's a question for the firm, not something to merge
mechanically. Same for the testimonials: two different curated sets.

**These are content decisions. We should not pick winners on the firm's behalf.**

**Update 2026-07-15 — `PracticeAreas.astro` resolved (for now).** The cards turned out
**not to be links** (plain `<div>`, no `<a>`), so the band is standalone marketing copy
and the mismatch breaks nothing. Migrated **verbatim** into `practiceAreasBand`, so the
site is unchanged and the firm can reconcile the wording in the Studio without a code
change. The underlying question — is the homepage aspirational, or is the tree
incomplete? — is still open and still theirs to answer, and it returns in **Phase 5**
when the real tree moves to Sanity. `Attorneys.astro` and `Testimonials.astro` remain
unresolved.

### F3 — Ordering is silent-failure territory

Every list's order today is array order in a file — deliberate curation. `news.ts` has
no dates at all. Sanity documents have **no inherent order**. Do nothing and the site
reshuffles with no error. See D2.

### F4 — `navigation.ts` statically imports the taxonomy ✅ RESOLVED (2026-07-17, D5)

It imported `practiceAreas` and `areasWeServe` and generated both menus. Now `getNavItems()`
fetches those branches (plus Attorneys) from Sanity; no runtime `src/` code imports the
static values anymore. See D5.

### F5 — Import scripts can't import the data files directly

`attorneys.ts` does `import danCogdell from "../assets/attorneys/dan-cogdell.jpg"`. A
plain Node script can't resolve `.jpg`. Run the scripts through a bundler that stubs
assets, or hand the script a path map and upload images separately.

### F6 — The site is a static build with `useCdn: false`

Content edits do **not** appear until a rebuild. Without the Phase 9 webhook, editors
will publish and see nothing change — which reads as "the CMS is broken."

### F7 — `getStaticPaths()` gets its own module scope

Astro hoists it. Module-scope consts in frontmatter are **not** visible inside it. Every
query it uses must be declared inside the function or imported. Fails at request time
with `ReferenceError`, not at build.

### F8 — Shared types ripple

`Block` / `Crumb` / `PracticeSection` are shared across practice, city, news **and**
legal pages. `Blocks`, `PracticeBody`, `Breadcrumb`, `PracticeFaqs` are shared renderers
— changing one touches four page types.

### F22 — Our Firm: founding + origin flipped to content-left

Both image bands (`FoundingAttorney`, `OriginStory`) were image-left / content-right;
the firm asked for the opposite. Done via **CSS `order` + swapped grid column widths**,
leaving the DOM order (media, body) untouched — so the **stacked mobile layout still leads
with the photo**, as it did before. Only the ≥901px layout flipped. If mobile should lead
with content instead, flip the `order` values in each component's `max-width: 900px` query.

### F21 — Portable Text vs JSX whitespace around inline `<em>` (accepted)

The only non-byte-identical migration was `/our-firm`. Its body paragraphs had inline
`<em>` on publication/book names. In the raw JSX source, Astro stripped the newline before
`<em>` (rendering e.g. `and<em>Texas Monthly` — "and" glued to the italic). Rendered from
blockContent via PortableText, the same text gets a normal space (`and <em>Texas Monthly`).

**Accepted as-is:** the PortableText version is arguably *more* correct, the difference is
one space around italic text, and the **visible word-level diff is zero** (browsers collapse
it). Byte-matching Astro's JSX whitespace-stripping in PortableText isn't feasible. Noted so
a future diff of /our-firm doesn't read as a regression.

Also: `blockContent` gained an `em`/italic decorator here (Bold was the only one before) —
a standard the SEO team wanted regardless.

### F20 — Homepage news: featured + 3-newest-excluding-featured

The homepage shows ONE chosen featured article (left) and the 3 newest OTHER items
(right); the featured must never appear in the right column. Mechanism: `homePage.news.featured`
is a reference to a `newsItem`; the right column is `order(coalesce(publishedAt, _createdAt)
desc)` filtered to exclude the featured `_id`, sliced to 3. Verified by re-featuring a
right-column item: it left the right column and the next-newest backfilled the slot.

**Dates:** the firm wanted "date added, overridable." Modelled as an optional `publishedAt`
that overrides the document's `_createdAt`; effective date = `coalesce(publishedAt,
_createdAt)`. The 12 seeded items got `publishedAt` descending in the file's curation order
so "newest" reproduced the old array order; editors set real dates in the Studio.

**Hybrid model kept:** a `newsItem` either links to external coverage (`linkType: "external"`,
`externalUrl`) or is a full article (`linkType: "article"`, `body` → /news/[slug]). All 12
today are external, so **no detail pages build yet** — the route is wired and waiting.
`data/news.ts` deleted (174 lines).

### F19 — Testimonials: two sets, zero overlap ✅ resolved

The homepage showed **3** quotes; `/testimonials` showed **16**. Not two versions of the
same thing — **no quote appeared in both**.

The 16 read as real client letters: varied voice, real attributions (P.W., M. K., Tami),
specific detail. The 3 were uniform — every one "Former Client", similarly polished, each
tagged to a different practice area matching the homepage's *marketing* taxonomy. That is
what design-phase placeholder copy looks like, and for a law firm the difference matters:
testimonials carry bar-advertising rules.

**Resolved (the firm's design):** one real pool. `testimonial` documents carry a
**`featured` toggle (max 3)**; the homepage and /attorneys band show the featured ones,
the wall shows all. The 3 placeholders were **not migrated** — homepage quotes changed,
deliberately. `data/testimonials.ts` deleted (89 lines).

**The cap is enforced twice, on purpose:**
- **Schema** — async validation counts other featured docs and blocks a 4th at publish
  (excluding both `drafts.x` and `x`, which are one document).
- **Query** — `| order(orderRank) [0...3]`, a backstop for anything that bypasses the
  Studio (a script, an import, an invalid draft). Verified by forcing a 4th: the homepage
  still rendered 3.

**Also:** `tag` is now an optional field, shown on the homepage card only and omitted when
blank — none of the real 16 have one yet. `featured` is seeded on the three *shortest*
quotes because the card was built for ~250 characters and the real ones run to 1018; the
firm re-picks via the toggle. Order is `orderRank` (D2), like attorneys.

**Font sizes still differ** between the two pages (quote `--text-base` vs `--text-sm`,
author `--text-lg` vs `--text-xs`) — the firm deferred unifying them.

### F18 — blockContent offered headings the CSS couldn't space ⚠️ resolved

**The firm spotted this, not me.** `global.css` resets `* { margin: 0 }` — the design is
zero-by-default and every component adds its own spacing. So the base `h1–h4` / `p` rules
set font and size but **no margins**.

That was fine while bands only rendered their own classed paragraph. But D12 gave the SEO
team H2–H4, lists and blockquotes, and each band's renderer only mapped `normal` —
everything else fell through to a **bare `<h2>` with no spacing at all**. I'd checked the
base styles existed; I never checked they included margins.

**Resolved** with a shared prose scope:
- `Blocks.astro`'s `prose__*` styles (paragraph, diamond-bullet list, quote, link) moved
  from that component's scoped `<style>` into **global.css → "Prose"**, unscoped, so every
  Portable Text renderer shares them. Verified the practice-areas pages render identical.
- **Added the missing heading rules** (`.prose__h2/h3/h4`) — spacing plus a size for `h4`,
  which had none — and a numbered-list variant.
- New `src/components/prose/*` renderers map h2/h3/h4, lists, blockquote and links to those
  classes; `proseComponents` is spread into all 8 blockContent consumers.
- **Paragraphs are deliberately NOT in the shared map** — each band styles its own
  (`.about__body`, `.hero__lead`…), and a shared `.prose p` rule would fight them.

Global margins on `h1–h4`/`p` were the tempting fix and would have been wrong: 68 bare
`<p>` and 82 bare `<ul>` already exist, and `.footer__legal` (41) + `.faq__answer` (6)
rely on the zero reset. The prose scope leaves them untouched.

**This is Phase 5's foundation too.** `Blocks.astro` now shares the exact classes its
`<PortableText>` replacement will emit (D3), so that swap is a renderer change, not a
restyle.

### F17 — "Order fixed in code" is a silent bug waiting for the 5th record ⚠️

**Shipped this in the attorney migration.** With no ordering field, I fixed the card order
with a hardcoded slug list and sorted by `indexOf`:

```ts
const CARD_ORDER = ["cogdell-dan-l", "dennis-aisha-j", "osso-anthony", "newton-brent-e"];
cards.sort((a, b) => CARD_ORDER.indexOf(a.slug) - CARD_ORDER.indexOf(b.slug));
```

Correct for exactly the four people who existed. A fifth attorney isn't in the list, so
`indexOf` returns **-1** — and they sort to the **front**, above the founder. No error, no
warning; it only surfaces the day the firm hires someone. The firm asked "what if there
are more than 4?" before it ever happened.

**Resolved** with D2's plugin (see above). Verified by creating a real 5th attorney with
**no** `orderRank` at all — worse than reality, since the Studio assigns one on create —
and confirming they land last, then deleting the probe.

**The general trap:** any code that enumerates today's records — a slug list, a fixed
count, an index-based lookup — is a bug scheduled for whenever the content grows. The
layout here was fine (a real `gap`, so a 5th card just wraps); it was the *data* order
that broke.

### F16 — A band has TWO kinds of content: the records and its own header ⚠️

**Missed this on the first pass and shipped an incomplete migration.**

The attorney band is a header (eyebrow, heading, lede) wrapping a grid of people.
Migrating the *people* to `attorney` documents felt like "the Attorneys section is done" —
but the band's own copy was still hardcoded, so **no Attorneys section appeared on the
Home Page in the Studio**. The firm spotted it, not me.

The two halves belong in different places, and that's the point:

| | Lives in | Why |
|---|---|---|
| The cards (name, role, photo, blurb) | `attorney` **documents** | A person is edited once and appears on `/`, `/attorneys`, and their bio page |
| The header (eyebrow, heading, lede) | `<page>.attorneys` **section** | It's page copy — each page words it its own way (D11) |

**Check for this on every remaining band.** `Testimonials`, `WhyChoose`, `Press`, `Faq`
and `Blog` all wrap a record list in page copy. Migrating the records is only half of it;
if no section shows up on the page document, the header was missed.

### F15 — Attorneys: the cards and bio pages disagreed on job titles ✅ resolved

The homepage/`/attorneys` cards and the bio pages stated **different roles for two of
four attorneys** — the live site contradicted itself:

| | Card said | Bio page said |
|---|---|---|
| Dan L. Cogdell | "Founding Attorney" | "Principal & Founder" |
| Brent E. Newton | **"Attorney"** | **"Of Counsel"** |

"Of Counsel" is a formal designation, not a synonym — the kind of thing a bar association
cares about. Unlike F13 (where both versions were true and were kept), this was an
inconsistency to settle, not a variation to preserve.

**Resolved:** one `attorney` document per person; `role` is a **single field** and the bio
page's wording won. This deliberately changed two visible card labels — the only content
change in the migration, verified by diffing every attribute of every card. The card's
one-line blurb lives on as `credential` (it never existed in `data/attorneys.ts` — only in
the component's array).

`data/attorneys.ts` is **deleted** (332 lines). Photos are in Sanity with hotspot (D6), so
a new hire needs no developer; they're served via `urlFor` rather than `astro:assets`, and
the emitted `<img>` matches the old output attribute-for-attribute apart from the URLs.
`bio` became `blockContent` (D12).

**Watch for:** `.cred__prose p` in `AttorneyBio` was scoped on **both** compounds
(`.cred__prose[cid] p[cid]`), so the Portable Text `<p>` broke it — fixed with
`:global(p)`. Exactly the F14 trap, caught by the lint.

### F14 — Scoped styles break when markup moves to a child component ⚠️

**Shipped this bug once — expect it again with every Portable Text renderer.**

Astro scopes a component's `<style>` by stamping `data-astro-cid-XXXX` onto the elements
in **that component's own template**. Move markup into a child component and the child's
elements get **no cid at all**, so the parent's scoped rules silently stop matching:

```
about__quote          cid = oxgmilyn      ← still styled (in About's template)
about__quote-text     cid = *** NONE ***  ← emitted by QuoteParagraph.astro → unstyled
about__quote-accent   cid = *** NONE ***  ← emitted by QuoteAccent.astro    → unstyled
```

The markup is *correct*; only the styling is gone — so it renders as unstyled text and no
build error fires.

**Fix:** scope the parent, opt the child out — `.about__quote :global(.about__quote-text)`.
The scoped ancestor keeps `:global` from leaking past the band. (Moving the CSS into the
child component also works; `:global` was chosen to keep a BEM block's styles in one file.)

**This will recur in Phase 5**, where `Blocks.astro` → `<PortableText>` moves *all*
practice-area body markup into renderers, and every `prose__*` rule is scoped in a parent.

**A diff that strips `data-astro-cid-*` cannot see this** — that's exactly what let it
through here; the HTML compared identical. Use the lint instead:

```bash
npm run build && python3 scripts/check-scoped-styles.py dist/index.html …
```

It flags any element whose class is targeted by a rule demanding a cid the element lacks
(skipping classes that also have a global rule). Verified to catch this bug and pass once
fixed.

**Pass the HTML files you want checked** — Astro inlines small stylesheets into the page
and emits larger ones to `dist/_astro/*.css`, so the lint reads **both**. An earlier
version only read the `.css` files and silently skipped every inlined component
(`PracticeAreas` among them), passing when it shouldn't have.

**Converted so far** (each needed `:global()`): `about.body` → `.about__col`,
`hero.lead` → `.hero__content`, `practiceAreasBand.description` →
`.practice__head-right`, plus the About quote's `.about__quote`.

### F13 — About vs TrialResults: same cases, differently badged ✅ resolved

The homepage carousel (6 short teasers) and `/trial-experience` (16 full write-ups)
described **the same verdicts** in two hardcoded arrays. Three matched by name exactly;
the other three were the same case renamed ("The Enron Trial" / "The Enron Scandal",
"Waco / Branch Davidian" / "Waco & the Branch Davidians", "Fraud Acquittal" / "Surgeon
Fraud Acquittal").

**Two cases carried different verdict badges:** *Physician Victory* and *Psychiatric
Fraud Victory* were "Acquitted" on the homepage but "Dismissed" on /trial-experience.
Not a factual error — reading both write-ups, those cases had acquittals **and**
dismissals, so each page badged a different true aspect. But it's an editorial
inconsistency the firm may still want to settle.

**Resolved:** one `trialResult` document per verdict (16), holding the full write-up plus
an optional **Homepage teaser** (`teaser.title` / `teaser.outcome` / `teaser.note`). GROQ
`coalesce`s teaser over the full copy, so both pages render exactly as before — including
those two differing badges — while the two versions now sit **in one record**, where drift
is visible instead of hidden across two files.

Order is per-page: `homePage.about.featured` (6 refs) and
`trialExperiencePage.trialResults.cases` (16 refs) each carry their own ordered list
(D11). **This is why no document-ordering plugin was needed** — D2 still applies to
types without a curating page (testimonials, news, practice areas).

### F10 — The dataset already had prior work ⚠️

A `homePage` document existed in `production` from **2026-07-07/08**, modelling the same
hero with different field names (`headlineItalic` / `headlineBold` / `lede` /
`nameplate`), an **uploaded mp4** for the firm film, and a **Sanity image** for the hero
background. It also already had `sellingPoints`. The schema for it was **never committed
to this repo** — `git log` shows only `firmDetails` ever existed.

Resolved 2026-07-15: hero replaced with the current model (Wistia kept, background left
in code — the Sanity model held one image and would have lost the mobile portrait art
direction). `sellingPoints` on the document was left untouched. The mp4 and image assets
remain in the dataset, now unreferenced.

**Backup of the original document: `docs/_backups/homePage.pre-migration.json`.**

**Lesson: query the dataset before assuming a clean slate.** `setIfMissing` silently
no-ops against existing data — the seed reported success while writing nothing, and only
the fields whose names happened to collide (`eyebrow`, `label`) rendered.

### F11 — `import.meta.env` is empty under the Sanity CLI

`sanity.config.ts` is loaded by **both** Astro/Vite (browser Studio) and the Sanity CLI
(`schema extract` / `typegen`). Under the CLI, `import.meta.env` is **defined but
empty**, while `process.env` carries `.env`. A `typeof import.meta.env !== "undefined"`
guard therefore picks the wrong source and fails with a misleading
`Invalid studio config format`. Read whichever source actually holds the value:

```ts
const projectId =
  import.meta.env?.PUBLIC_SANITY_PROJECT_ID ?? process.env?.PUBLIC_SANITY_PROJECT_ID;
```

### F12 — Studio "Import error" in dev after a schema change → hard reload

**Symptom:** `/admin` loads, but opening any document throws
`Failed to fetch dynamically imported module: .../node_modules/.vite/deps/pane-XXXX.js?v=…`.
Astro's overlay auto-reloads and the error just comes back.

**Cause:** adding a schema type (or any new import reachable from `sanity.config.ts`)
changes the Studio's dependency graph, so Vite re-optimizes deps and rewrites its chunk
filenames. Vite serves optimized deps with `Cache-Control: max-age=31536000, immutable`,
so the browser keeps re-using a cached module that points at a chunk that no longer
exists. The dead chunk returns **504** (Vite's deliberate "outdated optimize dep"
signal). A soft reload can't escape this — it re-reads the same cached module.

**Fix:** hard reload `/admin` (`Cmd+Shift+R`). The dev server does *not* need
restarting. If it persists: stop the dev server, `rm -rf node_modules/.vite`, restart,
hard reload.

Not a build problem — `npm run build` stays green throughout. Expect this each time we
add schema types.

### F9 — Misc

- **TypeGen names are global.** Duplicate `const X_QUERY` across files silently
  overwrite each other's types. Scope names per file.
- **Let Sanity generate `_id`s.** Explicit `_id` only for singletons. Parent/child
  links use real `reference` fields.
- **`@sanity/icons` has no named exports here** — `CogIcon` etc. break the build. Index
  into the `icons` map instead: `import { icons } from "@sanity/icons"` then
  `icon: icons.play`. Confirmed working (`video.ts`, `homePage.ts`, `structure.ts`).
- **Sanity images** need `image.domains` in `astro.config.mjs` if they go through
  `astro:assets` rather than raw `urlFor`.

---

## 5. Decisions

✅ = my recommendation. Overrule anything.

| # | Decision | Recommendation |
|---|---|---|
| **D1** | Practice-area hierarchy | ✅ Flat `practiceArea` docs + self-referencing `parent` ref. Single-segment slug; path built by walking ancestors. Keeps each sub-topic independently editable and preserves the catch-all route. *(Tree is shallower than it looks — only 2 areas have children, never past depth 2.)* |
| **D2** | Ordering (F3) | ✅ **Landed 2026-07-15 via `@sanity/orderable-document-list`** (attorneys were the first type to need it). Adds `orderRankField` + `orderRankOrdering` to the type, an `orderableDocumentListDeskItem` in `structure.ts`, and `| order(orderRank)` in the query — the Studio list becomes drag-to-reorder and a new document lands last. Ranks are `lexorank` strings (`0\|hzzzzz:`); backfill pre-existing docs with a script using the same lib (see `scripts/backfill-attorney-order.ts`) or their order is arbitrary. <br><br>**Use this for every type with no curating page** — testimonials, news, practice areas. Types ordered by a page's reference array (trial results, D11/F13) don't need it.
| **D3** | `Block` → Portable Text | ✅ Maps **1:1**. `{p}`→normal, `{ul}`→bullet listItem, `{quote}`→blockquote, `Inline`→link mark. Source is already structured, so it's an in-memory transform — no HTML parsing, no JSDOM. `Blocks.astro` → `<PortableText>` emitting the same `prose__*` classes, so CSS is untouched. |
| **D4** | Internal links in rich text | ✅ A `link` annotation toggling internal (`reference`) / external (`url`); internal resolves to a path at query time. Kills link rot when slugs change. Alt: keep raw `href` strings. |
| **D5** | Navigation (F4) | ✅ **Landed 2026-07-17.** `navigation.ts` stays in code but exports async `getNavItems()`; the three taxonomy branches — **Attorneys, Practice Areas, Areas We Serve** — come from slim `order(orderRank)` projections (attorney / practiceArea / serviceCity+locationPage). The pure helpers (`isOnTrail`, `normalizePath`, `isUnder`) are unchanged, so `MenuList` needed no edit. `Header` fetches once via `await getNavItems()` and passes `items` to `MobileNav` (was a second static import). Nav output verified **byte-identical** on home, a nested practice-area page, and a location page — desktop bar + mobile drawer. <br><br>**Note:** ✅ the data files were deleted in Phase 9 (2026-07-17); `Crumb` moved to `src/lib/breadcrumb.ts`. |
| **D6** | Images | ✅ Attorney photos + press logos → Sanity. Design/decorative assets stay in `src/assets` with `astro:assets`. Wistia posters stay remote. |
| **D7** | Marketing copy in components (§3b) | ✅ **Leave in code for now.** It's design-coupled, rarely changes, and moving it means a `homePage`/`ourFirmPage` singleton per section. Revisit if the firm asks to edit it. `trialResult` + `faq` are the exception — they're real, growing content. |
| **D13** | Site-wide content (CTA bar, Consult) | ⚠️ **Amended 2026-07-16: the Consult per-page override was REMOVED at the firm's request.** There is now ONE shared Consult record used on every page — no `consult` field on any page singleton or on `attorney`, and `getConsult()` takes no `pageId`. `/contact` previously overrode the copy ("Tell Us About Your Case.") and now shows the shared "Schedule Your Consultation." — an accepted, deliberate change. The **CTA bar override still exists** and is unaffected. The photo remains a per-page prop (art direction, D6). Original rationale below still explains why the shared-record half of the pattern exists. |
| **D13 (original)** | Site-wide content (CTA bar, Consult) | ✅ **One shared record + an optional per-page override.** `CtaBar` (~43 pages) and `Consult` (13 callers) both render nearly everywhere, including dynamic routes (`practice-areas/[...slug]`, `[city]/[slug]`, `news/[slug]`) that **have no page document at all** — so per-page copies (D11) can't serve them. <br><br>Shape: a content object defined once (`ctaBarContent`, `consultContent`), used by both the shared singleton's `content` and each page's override field, so an override can't drift out of shape. One GROQ `coalesce(override, default)` resolves it; the component self-fetches and takes `pageId`. <br><br>**Override is available wherever the component is used** (corrected 2026-07-15 — the first pass wrongly limited Consult to the two pages that already overrode it). The override lives on whatever document backs that page: a page singleton for static routes, and **the record itself** for dynamic ones — so `/attorney/[slug]` passes `attorney._id`, giving per-attorney copy. Verified: an override on Dan's document rendered on his page only. <br><br>Static pages that lacked a document got one (`videosPage`, `newsPage`, `practiceAreasPage`, `contactPage`, `ourFirmPage`), each holding only what's been migrated. **`practiceArea`, `locationPage` and `newsItem` get the `consult` field when they're built** (Phases 4–6) — until then those three routes use the shared default. <br><br>**Rule of thumb:** content on a handful of *known* pages → per-page copies (D11). Content on every page or on dynamic routes → shared + override (D13).
| **D15** | Per-page SEO fields | ✅ **Set 2026-07-23.** One shared `seo` object (`schemaTypes/seo.ts`) attached to all 14 routed documents — the 9 page singletons plus `practiceArea`, `locationPage`, `legalPage`, `newsItem`, `attorney`. Five fields: **`metaTitle`, `metaDescription`, `canonicalUrl`, `noIndex`, `ogImage`**. No keywords field (Google ignores the tag) and no separate og title/description (they'd double the field count for a case that rarely differs). <br><br>**Every field is optional and falls back to what the page already rendered** — the resolution lives in `src/lib/seo.ts` (`resolveSeo`), so adding the field to a document is a no-op until an editor fills it in. Verified: with the dataset untouched, all 45 pages' `<title>` and `<meta name="description">` are **byte-identical** to the pre-change build. <br><br>`metaTitle` replaces the page name only — **`\| Cogdell Law` is always appended**, so the SEO team never types the brand. The homepage's bare "Cogdell Law" survives when it has no `metaTitle`. <br><br>Length rules are **`.warning()`, never `.error()`**: publishing fires the Vercel deploy hook, so a blocking validation error over a 62-character title would stop the whole site rebuilding. <br><br>`/site-map` and `/404` have no backing document and keep code-level metadata; `/404` is hardcoded `noIndex`. |
| **D14** | Long-form page bodies: ONE field | ✅ **Set 2026-07-16.** `legalPage`, `practiceArea` and `locationPage` each have a single **Body Content** (`blockContent`) field — not an `intro` plus separate `sections[]`. Section headings are **H2 blocks inside the body**, styled in `ProseBody` to match the bespoke headings they replaced, so pages render the same. <br><br>**Consequence the firm accepted:** the old `intro` paragraphs rendered larger (they lived in a `.pbody__lead` wrapper). With one field nothing marks which paragraphs are "intro", so **body text is now uniform**. Visible text verified identical on all three page types; only the intro sizing changed. <br><br>`lede` stays a separate field on practice/location pages — it's the meta description + card summary, and still opens the body at render (as before). |
| **D12** | Rich text: one standard | ✅ **`blockContent` is the standard for every body-copy field** — practice areas, location pages, news, legal pages, attorney bios. Set 2026-07-15 because the site is handed to an **SEO team** afterwards, who need to add and edit **H1, H2, H3, H4, links and bold** consistently wherever prose appears. **Don't invent per-field rich-text types.** <br><br>Also carries **bulleted + numbered lists** and a **Quote** style — not decoration: `practice-areas.ts` uses `{ul}` and `{quote}`, so D3 cannot migrate without them. <br><br>**One deliberate exception:** `accentText` (the About pull quote) stays minimal — one line, one Accent button — because headings and lists have no styling there. <br><br>**No H1 — headings start at H2.** Every hero already renders the page's `<h1>` (`titleLead` + `titleStrong`), so a body H1 would make a second one. Briefly included at the SEO team's request, then dropped once that was clear. Don't add it back without moving the hero's heading first. <br><br>Links are a `url` annotation accepting relative paths today; **Phase 5 adds the internal/external reference toggle** (D4) once `practiceArea` documents exist to point at. |
| **D11** | Content shown on several pages | ✅ **Per-page copies, not one shared record.** Decided 2026-07-15 for the practice-areas band (home, /trial-experience, /testimonials): shared *schema* (`practiceAreasBand` object), separate *content* per page document, so pages can be worded differently. **Known trade-off:** the same six cards now live in three places and can drift — the very thing that caused F2. Accepted knowingly for editorial flexibility. Consequence: a component on N pages implies N page documents, so `/trial-experience` and `/testimonials` singletons exist now, holding only this band. |
| **D10** | Page sections in the Studio | ✅ **Every major section is an `object` field with `options: { collapsible: true, collapsed: true }` and NO `description`.** A page document then opens as a tidy list of closed accordions; the section title carries the meaning, and explanation belongs on the individual fields inside, where it's actually needed. Set by the firm 2026-07-15 — **apply to every new section and page document.** <br><br>**This applies even to list-only sections:** `collapsible` is an `ObjectOptions` flag — `ArrayOptions` has no such option, so a bare array field *cannot* collapse. Wrap it (`sellingPoints: { points: [...] }`). A collapsible `fieldset` also works, but keep one mechanism, not two. |
| **D9** | Who fetches: page or component? | ✅ **Shared components take props; page-only components self-fetch.** `Hero` is homepage-only, so it calls `getHomeHero()` itself. `SellingPoints` is shared with `/our-firm` (which passes its own `stats`), so it stays presentational and `index.astro` passes Sanity content in. Established 2026-07-15 with the selling points; applies to every remaining homepage section. Check the caller list before modelling — `Attorneys`, `Testimonials` and `PracticeAreas` are each used on more than one page. |
| **D8** | Video `duration` + `poster` | ✅ **Decided 2026-07-15: neither is a Studio field.** Wistia owns the runtime and the thumbnail, so hand-typed values can only drift. Both are read from Wistia's oEmbed at build time via `src/lib/wistia.ts` — verified against all 5 videos: every duration matched, and the derived poster is byte-identical to the old hardcoded URL. A `video` document is now just **curated title + `wistiaId`**. Trade-off accepted: the homepage hero now needs Wistia at build time (mitigated with retries — see §9). |

---

## 6. Phases

- [~] **Phase 0 — Foundations.** Partly done alongside the Hero:
  - [x] `sanity.cli.ts` + `npm run typegen` (with `--enforce-required-fields`)
  - [x] `sanity.types.ts` committed; `schema.json` gitignored
  - [x] No API token needed — seed scripts run via `npx sanity exec … --with-user-token`
  - [x] `getFirmDetails()` now typed automatically via TypeGen overloads
  - [x] `blockContent` + `link` types (D3/D4) — the rich-text standard (D12)
  - [x] `accentText` + renderers — Portable Text proven end to end on the About quote
  - [ ] `Block[]` → Portable Text converter util (`{p}`→normal, `{ul}`→bullet, `{quote}`→blockquote, `Inline`→link)
  - [ ] `blockContent` renderer (`prose__*` classes) — replaces `Blocks.astro`; **needs `:global()`, see F14**
  - [ ] `@sanity/orderable-document-list` (D2) — only for types with no curating page (see F13)
- [x] **Phase 1 — `testimonial`** *(pilot — smallest surface, proves schema → import → GROQ → render → cleanup end to end)*. Resolve F2 testimonials split first.
- [x] **Phase 2 — `video`.** Schema + content already done. Remaining: repoint `/videos`,
      `VideoGrid`, `VideoLightbox`; keep `wistiaEmbed()` in code; **implement the Wistia
      oEmbed duration fetch (D8, §9)** — the card badge has no other source.
- [x] **Phase 3 — `attorney`.** Upload 4 photos. Resolve F2 roles drift.
- [x] **Phase 4 — `newsItem` + `trialResult` + `faq`.** External/owned toggle; press logos; replace `latestNews` with a GROQ slice. Resolve F2 `About.astro` overlap.
- [x] **Phase 5 — `practiceArea`** *(the big one)*. D1 schema; sibling-scoped slug uniqueness; Studio tree structure; import parents→children; PT + link refs; replace `getPracticeAreaPaths()`/`walk()`/`topLevelCards`; decide where `icon` SVG paths live. Resolve F2 taxonomy divergence.
- [x] **Phase 6 — `serviceCity` + `locationPage`.** Replace `getAreaPaths()`; verify cross-links into `/practice-areas/*`.
- [x] **Phase 7 — Navigation.** D5. Nav is async off Sanity; full desktop + mobile regression verified byte-identical (home, nested practice area, location page). 2026-07-17.
- [x] **Phase 8 — `legalPage` + `firmDetails` expansion + interior page copy (our-firm, contact, all page heroes).** Address/email/social/hours; sweep for stray hardcoded phone numbers in body copy.
- [x] **Phase 9 — Publish pipeline.** ✅ Complete 2026-07-17.
  - [x] Delete `src/data` leftovers (data files + their 3 seed scripts); relocate `Crumb` → `src/lib/breadcrumb.ts`.
  - [x] Confirm dataset read access — `jk9lqisp/production` is **public**, anonymous read verified; no token needed.
  - [x] Vercel: project linked, `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET` set, Astro preset + `dist` output confirmed.
  - [x] Sanity: production domain added to **CORS origins** so the deployed Studio at `/admin` can authenticate.
  - [x] Webhook: Vercel Deploy Hook (`prj_dr1YCtqb…`, branch `master`) ← Sanity webhook "Sanity Publish" on `production`, Create/Update/Delete, **drafts toggle off** so only publishes rebuild (F6 resolved). Verified: a test publish triggered a Deploy Hook build. Note: each publish = full rebuild, which also re-fetches Wistia (retry-guarded).
  - [ ] Visual Editing — **deferred** (firm's open question, §7). Only remaining nice-to-have.

---

## 6b. SEO handoff (D15) — 2026-07-23

Everything the SEO team needs to work without a developer.

**Editable per page** — an "SEO" accordion at the bottom of every page document and every
practice area / location page / news item / attorney / legal page. All five fields optional:
meta title, meta description, canonical URL, "hide from search engines", social share image.
A site-wide fallback share image lives on **Firm Details → Default social share image**
(currently empty — **upload one**, or shared links render with no card image).

**Rendered in `<head>`** by `Layout.astro` from `resolveSeo()` (`src/lib/seo.ts`): title,
description, canonical, robots, `og:*` and `twitter:*`.

**Structured data** — three JSON-LD blocks, all derived from existing content, **no fields to
fill**: `LegalService` sitewide from Firm Details (address parsed out of `cityStateZip`, socials
→ `sameAs`), `BreadcrumbList` from the trail `Breadcrumb.astro` already renders (with Home
prepended as position 1 — the visible crumbs deliberately omit it), and `FAQPage` from
`PracticeFaqs.astro`. Built: 44 LegalService, 28 BreadcrumbList, 5 FAQPage; all parse, and no
page carries two FAQPages (`PracticeFaqs` and the homepage's `Faq.astro` never co-occur).

**`sitemap.xml`** — a **hand-rolled endpoint** (`src/pages/sitemap.xml.ts`), not
`@astrojs/sitemap`. That integration's `filter` is synchronous and can't see the per-page
`noIndex` flag, which would leave flagged pages in the submitted sitemap and make the toggle a
half-feature. The endpoint reuses `getPracticeAreaPaths()` / `getAreaPaths()` /
`getAttorneySlugs()` / `getOwnedNewsSlugs()`, so it can't drift from the routes that actually
build. Verified: 43 URLs = every built route except `/admin`, with `/404` excluded by design.
⚠️ `DOCUMENT_BACKED` / `CODE_ONLY` in that file are the one hand-maintained list — **add new
static routes there**.

**`site` is now set** in `astro.config.mjs` (`https://www.cogdell-law.com`) — canonical tags,
`og:url` and the sitemap all build from it.

⚠️ **Launch dependency:** Vercel must serve **www** as the primary domain with the apex
redirecting to it, or every canonical points at a redirect. The old WordPress URLs in
`vercel.json` are written apex-style, so confirm this at DNS cutover.

**Not verified against the live dataset:** the override and noIndex paths were proven through
the real render path with a throwaway page and a temporary flag, not by publishing test content
to `production` (that would have triggered a deploy). Worth one real Studio edit as a smoke test.

## 7. Open questions for the firm

- [ ] **F2 — homepage practice areas.** The grid advertises Complex Civil Litigation,
      Complex Personal Injury and Government Investigations, none of which exist in the
      practice-areas tree. Is the homepage aspirational, or is the tree incomplete?
- [ ] **F2 — testimonials.** Two different curated sets (3 tagged vs 16 untagged). One
      pool with a homepage flag, or genuinely separate?
- [ ] **F2 — attorney roles.** "Founding Attorney" or "Principal & Founder"?
- [ ] **D7** — does the firm want to edit homepage marketing copy themselves?
- [ ] News has no dates. Add a `date` field during migration, or keep it purely curated?
- [ ] Do they want Visual Editing (click-to-edit from the live site)? Affects Phase 9 scope.

---

## 9. Wistia oEmbed (D8)

Endpoint — public, no auth:

```
https://fast.wistia.com/oembed?url=https%3A%2F%2Fhome.wistia.com%2Fmedias%2F{wistiaId}
```

Returns `duration` in **seconds as a float** (`119.002`), plus `title` and
`thumbnail_url`. Format for the badge with `round()`, not `floor()` — verified this
reproduces all five hardcoded values exactly:

```ts
const fmt = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
// 119.002 → "1:59"   190.4 → "3:10"   63.1 → "1:03"
```

`thumbnail_url` comes back at 960x540; `image_crop_resized` is just a query param on one
underlying asset, so `posterAt()` rewrites it to the 1280x720 the design uses. Verified:
the derived URL is byte-identical to the previously hardcoded poster.

**Implemented** in `src/lib/wistia.ts` — `getWistiaMeta(wistiaId)` returns
`{ duration, poster, title }`:
- **Memoized** per `wistiaId` for the life of the build (`/videos` and the hero overlap).
  Rejections aren't cached, so a later caller can retry.
- **10s timeout**, **3 attempts** with backoff for transient failures.
- **404 is not retried** — Wistia returns a clean 404 for an unknown id, which means a
  bad Wistia ID in the Studio, not a blip. Fails fast with a message naming the id.

⚠️ **Operational risk (accepted).** Wistia is now a build-time dependency of the
**homepage**. A sustained Wistia outage fails the deploy — the same class of dependency
as Sanity itself, and preferable to silently shipping a hero with no video poster. The
retries cover blips.

**Phase 2 remaining:** `VideoGrid` still reads `duration` from `data/videos.ts`. Point it
at `getWistiaMeta()` when `/videos` moves to Sanity, or the badge goes blank.

## 8. Reference

```bash
npm run dev          # astro dev — Studio at /admin
npm run build        # must stay green after every row
npm run typegen      # (after Phase 0) schema extract + typegen generate
```

**Env** — `.env` (gitignored):
```
PUBLIC_SANITY_PROJECT_ID=...   # present
PUBLIC_SANITY_DATASET=...      # present
SANITY_API_WRITE_TOKEN=...     # TODO — Phase 0, import scripts only
```

**Already wired** (the pattern to follow): `firmDetails` singleton —
`schemaTypes/firmDetails.ts`, `lib/firmDetails.ts` (`getFirmDetails()`),
`lib/image.ts` (`urlFor`), `structure.ts`; consumed by `Header.astro` (logo) and
`Footer.astro` (phone). Studio embedded at `/admin`.

**Conventions** (from the `sanity-best-practices` skill): `defineType` /
`defineField` / `defineArrayMember`, always. Model data, not presentation. `reference`
for reusable content, nested `object` for document-specific. Never delete a field with
production data — deprecate → readOnly → hidden.
