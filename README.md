# Cogdell Law Firm

Marketing site for Cogdell Law Firm (Houston, TX) — a statically generated Astro
site with an embedded Sanity Studio and a single serverless function for the
consultation form.

Every word and image on the public site comes from Sanity. There is no hardcoded
copy left; the only images still in the repo are design backdrops (hero art,
section backgrounds) that need Astro's build-time optimization.

## Stack

| Piece           | What it is                                                              |
| --------------- | ----------------------------------------------------------------------- |
| **Astro 7**     | Static output. Every page is prerendered at build time — no SSR.         |
| **Sanity 6**    | Content lake + Studio, embedded at `/admin` (no separate Studio deploy). |
| **Vercel**      | Hosting. Publishing in Sanity fires a webhook that triggers a rebuild.   |
| **Resend**      | Sends the consultation form. One function at `POST /api/consult`.        |
| **Astro Fonts** | Cormorant Garamond + Instrument Sans, self-hosted from the build.        |

React is a dependency of the Sanity Studio only — the public site ships no
client framework, and no page loads more than a few hundred bytes of JS.

## Getting started

```bash
npm install
```

Create `.env` in the repo root:

```
PUBLIC_SANITY_PROJECT_ID=<project id>
PUBLIC_SANITY_DATASET=production
PUBLIC_PAGEPROOFER_SITE_ID=<pageproofer embed id>   # optional, see "Before launch"
```

Then:

```bash
npm run dev
```

The site is at `http://localhost:4321` and the Studio at
`http://localhost:4321/admin`.

## Commands

| Command           | Action                                                                |
| ----------------- | --------------------------------------------------------------------- |
| `npm run dev`     | Dev server on `localhost:4321`, Studio at `/admin`                    |
| `npm run build`   | Production build to `./dist/`                                         |
| `npm run preview` | Serve the built output locally                                        |
| `npm run typegen` | Regenerate `sanity.types.ts` — **run after every schema/query change** |

`npm run typegen` extracts the schema to `schema.json` (gitignored) and rewrites
`sanity.types.ts` (committed). It also prints one harmless error about
`src/sanity/eliteTheme.d.ts`: TypeGen parses declaration files as ordinary
TypeScript and trips over the initializer-less `const`. The types still generate
correctly.

## Layout

```
api/consult.ts          Vercel function — the consultation form → Resend
src/
  pages/                Routes. Static pages plus the dynamic ones:
                          practice-areas/[...slug]   [city]/[slug]
                          attorney/[slug]   news/[slug]   podcast/[slug]
  components/           One folder per section of the site
    prose/              Portable Text renderer maps (see below)
    body/               Blocks an editor can drop into a page body
  layouts/Layout.astro  <head>, header, footer, SEO, JSON-LD
  lib/                  Framework-free helpers (SEO, schema.org, Wistia…)
  sanity/
    lib/                One module per document type — GROQ queries + fetchers
    schemaTypes/        The content model
    structure.ts        The Studio's sidebar (Pages / Collections / Site Settings)
  styles/global.css     Design tokens, reset, `.prose__*`, `.btn`, `.container`
scripts/                Sanity CLI scripts — content seeds + two dev tools
docs/                   sanity-integration.md — the build's decision record
```

### Studio organisation

Three groups in the sidebar:

- **Pages** — one singleton per route (Home Page, Contact Page…), plus a
  **Legal** folder holding the two fixed legal documents.
- **Collections** — the repeatable records. Attorney Bios, Practice Areas,
  Service Cities, Location Pages, Videos and FAQs are drag-to-reorder, and that
  order is what the site renders. Testimonials, News Articles, Podcast Episodes
  and Trial Results are plain lists.
- **Site Settings** — Firm Details, Call-to-Action Bar, Consultation Form,
  Fact-Checked Banner, Global SEO Settings.

Singletons are kept out of the global "＋ Create" menu so none can be duplicated
into an orphan.

### Portable Text

Three renderer maps, deliberately kept separate (`src/components/prose/`):

- `components.ts` — headings, lists, links, quotes. No paragraph: each band
  styles its own.
- `bodyComponents.ts` — the above plus a standard `.prose__p` paragraph. For
  long-form bodies (legal pages, FAQ answers, attorney bios, news, podcasts).
- `pageBodyComponents.ts` — the above plus the insertable layout blocks (CTA
  banner, phone bar, attorney card, attorney quote, testimonial). **Only**
  `practiceArea.body` and `locationPage.body` get this map, because only those
  two fields accept the blocks.

## Deploying

Vercel builds from `master`. A Sanity publish fires a deploy webhook, so
published content goes live on the next build without a code change.

`vercel.json` holds the 301s from the old site's URLs. Redirects belong there,
not in the app.

`astro.config.mjs` sets `site: "https://www.cogdell-law.com"` — every canonical
tag, `og:url` and sitemap entry is built from it, so it must match the domain
Vercel serves as primary (www, with the apex redirecting to it).

### Before launch

The **Global SEO Settings → Discourage crawling** switch is currently **on**. It
forces `noindex,nofollow` on every page and makes `/robots.txt` serve
`Disallow: /`. Turn it off when the site moves to its real domain, or it will not
be indexed.

The consultation form is still on Resend's test mode: leads only reach the
address the Resend account was created with. Verify the domain in Resend, then
set `CONSULT_FROM_EMAIL` and `CONSULT_TO_EMAIL` in Vercel.

**Delete `PUBLIC_PAGEPROOFER_SITE_ID` in Vercel.** It loads the PageProofer
review widget at the end of every page's `<body>`. With the variable unset the
script is not in the built HTML at all, so removing it in Vercel and redeploying
is the whole job — no code change.

### Third-party scripts

`Layout.astro` is the only head on the site, so every tag goes there.

- **Review/dev tools** (PageProofer): gate on an env var, as above, so they can
  never outlive the phase they were added for.
- **Marketing tags** (GA4, pixels, call tracking): these belong in **Google Tag
  Manager**, not here. Add the GTM container once and every later tag is a GTM
  change — no rebuild, no deploy. GTM is not installed yet.
- **Never** add a free-form "paste a script" field in Sanity. It would be
  injected with `set:html`, so one malformed paste takes down every page, and a
  rebuild is needed either way — it buys nothing over a deploy.

## Conventions

- **No inline styles.** Scoped `<style>` blocks, `global.css` helpers, or tokens.
- **Spacing comes from `--space-*` tokens.** If none fits, add a step to
  `global.css` rather than hardcoding a value.
- **Every eyebrow gets the 24px accent rule** — use `<Eyebrow>`, don't hand-roll.
- **Every `.btn` carries the trailing `.btn__icon` arrow.**
- **Interior page heroes use `PageHero.astro`.** Don't write a new hero.
- Astro scopes a component's `<style>` to _its own_ template. Markup moved into a
  child component loses the scoping attribute and silently drops its styling —
  reach for `.parent :global(.child)`. `scripts/check-scoped-styles.py` catches
  it:

  ```bash
  npm run build && python3 scripts/check-scoped-styles.py dist/**/index.html
  ```

## Scripts

Run through the Sanity CLI, which loads the same `.env`:

```bash
npx sanity exec scripts/<name>.ts --with-user-token
```

The `seed-*.ts` scripts created the initial content. They match on slug or use
`setIfMissing`, so re-running updates rather than duplicating — but they are
history, not tooling: content is edited in the Studio now.

Two are ongoing tools:

- `audit-drafts.ts` — lists unpublished drafts and checks practice-area ordering.
- `check-scoped-styles.py` — the scoped-style lint described above.
