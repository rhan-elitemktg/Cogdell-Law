# Sanity Integration — Progress Tracker

Living tracker for moving Cogdell Law from static content to Sanity. Every page and
component in the site is listed below. Check cells off as we go.

**Guiding rule:** the site works today. Every row must leave `astro build` green and
the rendered page identical. One content type at a time — never a big bang.

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
| `practiceAreaCard` | `PracticeAreas.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done |
| `practiceAreasBand` | `PracticeAreas.astro` | object | — | `[x]` | `[x]` | `[x]` | ✅ done — one copy per page (D11) |
| `trialExperiencePage` | `trial-experience.astro` | singleton | 1 | `[x]` | `[~]` | `[x]` | band only; rest of page pending |
| `testimonialsPage` | `testimonials.astro` | singleton | 1 | `[x]` | `[~]` | `[x]` | band only; quotes are Phase 1 |
| `video` | `data/videos.ts` | document | 5 | `[x]` | `[x]` | `[~]` | ✅ schema+content — title + `wistiaId` only (D8) |
| `blockContent` (Portable Text) | `Block[]` in `practice-areas.ts` | object | — | `[ ]` | — | `[ ]` | 0 |
| `link` (annotation) | `Inline{text,href}` | object | — | `[ ]` | — | `[ ]` | 0 |
| `testimonial` | `data/testimonials.ts` | document | 16 | `[ ]` | `[ ]` | `[ ]` | 1 |
| `attorney` | `data/attorneys.ts` | document | 4 | `[ ]` | `[ ]` | `[ ]` | 3 |
| `newsItem` | `data/news.ts` | document | ~10 | `[ ]` | `[ ]` | `[ ]` | 4 |
| `trialResult` ⚠️ *new* | `TrialResults.astro` | document | ~12 | `[ ]` | `[ ]` | `[ ]` | 4 |
| `faq` ⚠️ *new* | `Faq.astro` | document | ~6 | `[ ]` | `[ ]` | `[ ]` | 4 |
| `practiceArea` | `data/practice-areas.ts` | document | ~20 | `[ ]` | `[ ]` | `[ ]` | 5 |
| `serviceCity` | `data/areas-we-serve.ts` | document | 6 | `[ ]` | `[ ]` | `[ ]` | 6 |
| `locationPage` | `data/areas-we-serve.ts` | document | ~15 | `[ ]` | `[ ]` | `[ ]` | 6 |
| `legalPage` | `privacy.astro`, `disclaimer.astro` | document | 2 | `[ ]` | `[ ]` | `[ ]` | 8 |
| `firmDetails` *(expand)* | scattered hardcoded | singleton | 1 | `[ ]` | `[ ]` | `[ ]` | 8 |

⚠️ `trialResult` and `faq` were **not** in the original plan — they're real content
currently buried inside components. See section 4, finding F1.

**Staying in code (by design)**

| What | Why |
|---|---|
| `data/us-states.ts` | SVG path reference data for the map. Never CMS. |
| `data/navigation.ts` | Structure, not content — but must go async. See D5. |
| `wistiaEmbed()` | Pure URL helper. |
| Design assets (`hero-boardroom`, `whychoose-bg`, `firm-steps`…) | Layout, not content. Keep `astro:assets`. |

---

## 2. Pages

All 16 routes. "Depends on" is the content type(s) the page needs before it can be wired.

| Route | File | Depends on | Schema | Content | Wired | Verified | Phase |
|---|---|---|---|---|---|---|---|
| `/testimonials` | `pages/testimonials.astro` | `testimonial` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 1 |
| `/videos` | `pages/videos.astro` | `video` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 2 |
| `/attorneys` | `pages/attorneys.astro` | `attorney` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 3 |
| `/attorney/[slug]` | `pages/attorney/[slug].astro` | `attorney` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 3 |
| `/news` | `pages/news/index.astro` | `newsItem` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 4 |
| `/news/[slug]` | `pages/news/[slug].astro` | `newsItem` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 4 |
| `/trial-experience` | `pages/trial-experience.astro` | `trialResult` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 4 |
| `/practice-areas` | `pages/practice-areas/index.astro` | `practiceArea` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 5 |
| `/practice-areas/[...slug]` | `pages/practice-areas/[...slug].astro` | `practiceArea` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 5 |
| `/[city]/[slug]` | `pages/[city]/[slug].astro` | `serviceCity`, `locationPage` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 6 |
| `/` | `pages/index.astro` | *(composition only)* | — | — | `[ ]` | `[ ]` | 1–5 |
| `/our-firm` | `pages/our-firm.astro` | `attorney`, page copy | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 7 |
| `/privacy` | `pages/privacy.astro` | `legalPage` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 8 |
| `/disclaimer` | `pages/disclaimer.astro` | `legalPage` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 8 |
| `/contact` | `pages/contact.astro` | `firmDetails` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | 8 |
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
| `TestimonialsWall.astro` | `data/testimonials.ts` | `testimonial` | `[ ]` | `[ ]` | 1 |
| `Testimonials.astro` ⚠️ | **own array** (3, w/ `tag`) | `testimonial` | `[ ]` | `[ ]` | 1 |
| `Hero.astro` | ~~`data/videos.ts`~~ | `homePage.hero` + `video` | `[x]` | `[x]` | ✅ done |
| `SellingPoints.astro` | ~~`defaultPoints`~~ | `homePage.sellingPoints` (via `index.astro`) | `[x]` | `[x]` | ✅ done |
| `video/VideoGrid.astro` | `data/videos.ts` (type) | `video` | `[ ]` | `[ ]` | 2 |
| `video/VideoLightbox.astro` | props | `video` | `[ ]` | `[ ]` | 2 |
| `attorney/AttorneyBio.astro` | `data/attorneys.ts` (type) | `attorney` | `[ ]` | `[ ]` | 3 |
| `attorney/AttorneyHero.astro` | `data/attorneys.ts` (type) | `attorney` | `[ ]` | `[ ]` | 3 |
| `Attorneys.astro` ⚠️ | **own array** (4, roles differ) | `attorney` | `[ ]` | `[ ]` | 3 |
| `about/FoundingAttorney.astro` | hardcoded copy | `attorney` | `[ ]` | `[ ]` | 3 |
| `news/NewsGrid.astro` | `data/news.ts` (type) | `newsItem` | `[ ]` | `[ ]` | 4 |
| `Blog.astro` | `data/news.ts` (`latestNews`) | `newsItem` | `[ ]` | `[ ]` | 4 |
| `TrialResults.astro` ⚠️ | **own array** (~12 cases) | `trialResult` | `[ ]` | `[ ]` | 4 |
| `About.astro` ⚠️ | **own array** (overlaps above) | `trialResult` | `[ ]` | `[ ]` | 4 |
| `Faq.astro` ⚠️ | **own array** (~6 Q&A) | `faq` | `[ ]` | `[ ]` | 4 |
| `practice/Blocks.astro` | `Block`/`Inline` types | → `<PortableText>` | `[ ]` | `[ ]` | 5 |
| `practice/PracticeBody.astro` | `practice-areas.ts` (types) | `practiceArea` | `[ ]` | `[ ]` | 5 |
| `practice/PracticeFaqs.astro` | `practice-areas.ts` (type) | `practiceArea` | `[ ]` | `[ ]` | 5 |
| `practice/Breadcrumb.astro` | `Crumb` type | `practiceArea` | `[ ]` | `[ ]` | 5 |
| `PracticeAreas.astro` | ~~own array~~ | `practiceAreasBand` ×3 pages | `[x]` | `[x]` | ✅ done |
| `Header.astro` | `navigation` + `firmDetails` | nav async | `[~]` | `[ ]` | 7 |
| `MenuList.astro` | `data/navigation.ts` | nav async | `[ ]` | `[ ]` | 7 |
| `MobileNav.astro` | `data/navigation.ts` | nav async | `[ ]` | `[ ]` | 7 |
| `Footer.astro` | `firmDetails` + hardcoded links | `firmDetails` | `[~]` | `[ ]` | 7–8 |
| `ContactMethods.astro` | hardcoded phone/email | `firmDetails` | `[ ]` | `[ ]` | 8 |
| `Press.astro` | 10 logo imports | *decide* | `[ ]` | `[ ]` | 4 |

`Header` / `Footer` are `[~]` — already partly on Sanity (logo, phone) but still hold
hardcoded nav links and socials.

### 3b. Hardcoded marketing copy — needs decision D7

Real content, but design-coupled and rarely changed. Decide per D7 whether it moves.

| Component | Hardcoded content | Wired | Verified |
|---|---|---|---|
| `WhyChoose.astro` | `features` — 4× icon/title/body | `[ ]` | `[ ]` |
| ~~`SellingPoints.astro`~~ | ✅ done — now presentational, see §3a | `[x]` | `[x]` |
| `about/Values.astro` | `values` — 4× icon/title/body | `[ ]` | `[ ]` |
| `about/OriginStory.astro` | `milestones` — timeline | `[ ]` | `[ ]` |
| `about/AboutIntro.astro` | intro copy | `[ ]` | `[ ]` |
| `about/QuoteBand.astro` | pull quote | `[ ]` | `[ ]` |
| `FirmStory.astro` | firm story copy | `[ ]` | `[ ]` |
| `Consult.astro` | consult copy + phone | `[ ]` | `[ ]` |
| `CtaBar.astro` | CTA copy + phone | `[ ]` | `[ ]` |
| `VideoBand.astro` | band copy | `[ ]` | `[ ]` |
| `pages/our-firm.astro` | `stats` — 4 stats | `[ ]` | `[ ]` |

### 3c. Presentational — no Sanity work

Props-driven or pure layout. Listed for coverage; nothing to do.

| Component | Why |
|---|---|
| `Eyebrow.astro` | Pure presentation |
| `PageHero.astro` | Props-driven |
| `practice/PracticeGrid.astro` | Props-driven |
| `PracticeReach.astro` | Uses `us-states.ts` — stays static |
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
| `Attorneys.astro` | 4 attorneys, `"Founding Attorney"` | `attorneys.ts` says `"Principal & Founder"` | Roles drifted |
| `Testimonials.astro` | 3 quotes, all `"Former Client"` + `tag` | `testimonials.ts` has 16, initials, no tags | **Different quotes entirely** |
| `PracticeAreas.astro` | Complex Civil Litigation, Complex Personal Injury, Government Investigations… | Health Care Fraud, Federal Criminal Cases, Fraud & White Collar, Appeals | **Different taxonomy** |
| `About.astro` | `results` — Enron, Waco | overlaps `TrialResults.astro`'s cases | Same cases, two places |

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

### F4 — `navigation.ts` statically imports the taxonomy

It imports `practiceAreas` and `areasWeServe` and generates both menus. That import dies
the moment those move. See D5.

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
| **D2** | Ordering (F3) | ✅ `@sanity/orderable-document-list` + `order(orderRank)` in GROQ. Alt: a plain `order` number field — free, but manual renumbering. |
| **D3** | `Block` → Portable Text | ✅ Maps **1:1**. `{p}`→normal, `{ul}`→bullet listItem, `{quote}`→blockquote, `Inline`→link mark. Source is already structured, so it's an in-memory transform — no HTML parsing, no JSDOM. `Blocks.astro` → `<PortableText>` emitting the same `prose__*` classes, so CSS is untouched. |
| **D4** | Internal links in rich text | ✅ A `link` annotation toggling internal (`reference`) / external (`url`); internal resolves to a path at query time. Kills link rot when slugs change. Alt: keep raw `href` strings. |
| **D5** | Navigation (F4) | ✅ Keep `navigation.ts` in code but export async `getNavItems()` fetching a slim projection. `Header`/`MobileNav` already await in frontmatter. The pure helpers (`isOnTrail`, `normalizePath`, `isUnder`) don't change. |
| **D6** | Images | ✅ Attorney photos + press logos → Sanity. Design/decorative assets stay in `src/assets` with `astro:assets`. Wistia posters stay remote. |
| **D7** | Marketing copy in components (§3b) | ✅ **Leave in code for now.** It's design-coupled, rarely changes, and moving it means a `homePage`/`ourFirmPage` singleton per section. Revisit if the firm asks to edit it. `trialResult` + `faq` are the exception — they're real, growing content. |
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
  - [ ] `blockContent` + `link` types (D3/D4)
  - [ ] `Block[]` → Portable Text converter util
  - [ ] `@sanity/orderable-document-list` (D2)
- [ ] **Phase 1 — `testimonial`** *(pilot — smallest surface, proves schema → import → GROQ → render → cleanup end to end)*. Resolve F2 testimonials split first.
- [ ] **Phase 2 — `video`.** Schema + content already done. Remaining: repoint `/videos`,
      `VideoGrid`, `VideoLightbox`; keep `wistiaEmbed()` in code; **implement the Wistia
      oEmbed duration fetch (D8, §9)** — the card badge has no other source.
- [ ] **Phase 3 — `attorney`.** Upload 4 photos. Resolve F2 roles drift.
- [ ] **Phase 4 — `newsItem` + `trialResult` + `faq`.** External/owned toggle; press logos; replace `latestNews` with a GROQ slice. Resolve F2 `About.astro` overlap.
- [ ] **Phase 5 — `practiceArea`** *(the big one)*. D1 schema; sibling-scoped slug uniqueness; Studio tree structure; import parents→children; PT + link refs; replace `getPracticeAreaPaths()`/`walk()`/`topLevelCards`; decide where `icon` SVG paths live. Resolve F2 taxonomy divergence.
- [ ] **Phase 6 — `serviceCity` + `locationPage`.** Replace `getAreaPaths()`; verify cross-links into `/practice-areas/*`.
- [ ] **Phase 7 — Navigation.** D5. **Full nav regression, desktop + mobile.**
- [ ] **Phase 8 — `legalPage` + `firmDetails` expansion.** Address/email/social/hours; sweep for stray hardcoded phone numbers in body copy.
- [ ] **Phase 9 — Publish pipeline.** Vercel env vars; Sanity webhook → deploy hook (F6); confirm dataset public or add read token; consider Visual Editing; delete `src/data` leftovers; final build.

---

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
