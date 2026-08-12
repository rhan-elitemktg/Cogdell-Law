# Cogdell Law Firm — site status & operating notes

**Prepared 12 August 2026.** The site is **live on the production domain**. Everything in the
"Confirmed working" table below was tested against `www.cogdell-law.com` directly, not
inferred from the code.

| | |
| --- | --- |
| Live site | `www.cogdell-law.com` — 200, apex 307s to `www` |
| Repo | `rhan-elitemktg/Cogdell-Law`, `master` at `3b431f4` |
| Vercel team | `elite-legal-marketing` |
| Search engines | Crawling enabled, 47 URLs in the sitemap |
| Consultation form | Live — delivers to three firm addresses |
| Review widget | PageProofer **ON** in production — temporary, see below |

---

## Open — PageProofer is back on production

**Re-enabled 12 August 2026 for a client review round. Deliberate, and meant to be
temporary.** `PUBLIC_PAGEPROOFER_SITE_ID` was set on Production and the site redeployed;
the widget is confirmed loading on the live homepage.

It renders at the end of **every** page's `<body>` — including `/contact`, where visitors
type descriptions of their legal situation into the consultation form. That is the reason
it shouldn't stay on any longer than the review needs.

To take it back off:

```bash
vercel env rm PUBLIC_PAGEPROOFER_SITE_ID production
```

Then redeploy — `vercel redeploy <current-production-url>` rebuilds from the same git
commit rather than from a local working tree. `Layout.astro` renders the tag only when the
variable is set, so unsetting it removes the script from the built HTML entirely. **There
is no code change in either direction**, and the ID also lives in the repo's local `.env`,
so removing it from Vercel loses nothing.

One wrinkle: the CLI added the variable as **Sensitive**, so its value can't be read back
out of Vercel. Harmless here — it's a `PUBLIC_` embed ID that ships in the page source
anyway — but that's why the local `.env` copy matters.

---

## Settings that live only in Vercel

Recorded here because neither is visible anywhere in the repo.

**`CONSULT_TO_EMAIL` holds three firm addresses:**

```
dan@cogdell-law.com, laken@cogdell-law.com, paralegal@cogdell-law.com
```

Delivery to all three is confirmed. `info@cogdell-law.com` was considered and deliberately
not used. No agency address is on the list — the form asks people to describe their
situation, so submissions are prospective-client communications and belong only in firm
inboxes. Adding one back is a decision for the firm, not a convenience.

The variable is marked *Sensitive*, so the dashboard hides its value — replace it wholesale
rather than editing around what's there, and **redeploy afterwards or nothing changes.**
That last point applies to every variable here: Vercel bakes them in at deploy time.

---

## Confirmed working

| Check | Result | |
| --- | --- | --- |
| Domain cutover from FindLaw | `www` resolves to Vercel DNS; apex 307s to `www` | Pass |
| Indexing | `robots.txt` serves `Allow: /`; only `/admin` blocked | Pass |
| Old team URL | `/attorneys` → 301 → `/our-team` | Pass |
| Old bio URLs | `/attorney/{slug}` → 301 → `/our-team/{slug}` | Pass |
| Legacy FindLaw URLs | 301 to the new city paths | Pass |
| Trailing-slash variants | Slashed legacy URLs redirect too, not 404 | Pass |
| Team content | 4 attorneys + Laken Knox (Paralegal); no placeholder copy remains | Pass |
| Demo practice area | Deleted from Sanity | Pass |
| Email delivery | Reaches all three firm addresses | Pass |
| PageProofer widget | Re-enabled 12 Aug for review — must come back off | Open |

---

## Two ways things reach the live site

This trips people up more than anything else on the project. Content and code ship by
completely separate routes, and neither one carries the other.

**Content — automatic.** Anything edited in the Studio at `/admin`: page copy, team members,
practice areas, redirects, SEO fields. Hitting **Publish** fires a webhook that rebuilds and
deploys on its own. No developer, no merge, live in a couple of minutes.

**Code — needs a merge.** Anything in the repo: templates, styles, the email function, images
in `src/assets`. Work happens on a branch, then merges to `master`, which is what deploys. A
change sitting on a branch is not live, however finished it looks.

**Environment variables are a third case.** They're read at deploy time, so editing one in the
Vercel dashboard changes nothing until the next deployment. Both action items above depend on
this.

---

## How the moving parts work

### Redirects live in two places

Most redirects are **Sanity documents**, managed by the SEO team with no developer involved:
Studio → Site Settings → Global SEO Settings → Redirects. At build time they're written to
`dist/bulk-redirects.json`, which Vercel reads via `bulkRedirectsPath` in `vercel.json`. There
are 9 today.

Two rules can't live there, because bulk redirects don't support wildcards. They stay in
`vercel.json` and are a code change:

```
/health-care-fraud-defense/:path*  →  /practice-areas/health-care-fraud-defense/:path*
/attorney/:slug                    →  /our-team/:slug
```

`vercel.json` also sets `"trailingSlash": false`. That matters more than it looks: Vercel
matches redirect sources exactly, and the old FindLaw URLs all ended in a slash. Without it,
every legacy link would 404 instead of redirecting.

One hazard worth knowing: bulk redirects are evaluated **before** the filesystem, so a rule
whose source points at a live page would black-hole that page. `src/pages/bulk-redirects.json.ts`
drops any such rule at build time and logs it — check the build output for a
`[bulk-redirects] skipped` line if a redirect seems to vanish.

### The consultation form

One serverless function, `api/consult.ts`, deployed alongside the static site. It is the only
code in the project that sends email.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Initializes the Resend client. Secret — never reaches the browser. |
| `CONSULT_TO_EMAIL` | Who receives leads. Comma-separated; currently the three firm addresses above. |

The sender is hardcoded to `noreply@send.cogdell-law.com` rather than being a variable. That
address has to sit on the `send.` subdomain — that's what's verified in Resend, and anything
else is rejected — so putting it in a dashboard field only creates a way to break sending
silently.

Reply-to is set to whatever the visitor typed, so staff reply straight to the prospect. A
hidden honeypot field catches bots: if it's filled, the function returns success and sends
nothing.

### Photography

Section images are art-directed and live in the repo, not Sanity, because the crops are design
decisions:

| Where | Asset |
| --- | --- |
| Consultation band (44 pages) | `consult-team.jpg` — courthouse corridor |
| Statement band (homepage) | `team-photo.jpg` — four attorneys |
| Why Choose band | `meeting-room.jpg` — boardroom |
| Hero, phones only | `hero-mobile.jpg` — Dan, cropped for a narrow screen |

Team member headshots are the exception — those are in Sanity, so a new hire doesn't need a
developer.

---

## Gotchas that will cost you an afternoon

- **Redirects never work on localhost.** `vercel.json` is platform configuration; the Astro dev
  server never reads it. A redirect that looks broken on `localhost:4321` is almost always
  fine. Test on the deployed site.
- **The email function never runs locally either.** `astro dev` doesn't execute `api/`, and the
  Resend keys are only set in Vercel. Testing the form means deploying.
- **Preview deployments are behind SSO.** Branch previews return a login redirect to anyone not
  signed in to Vercel, which makes them useless for sharing with a client. Production is public.
- **`astro build` does not typecheck `api/`.** It isn't part of the Astro route tree. Also
  `@types/node` isn't installed, so `npx tsc --noEmit` reports dozens of pre-existing `process`
  errors across the repo — compare before and after a change rather than expecting a clean run.
- **The `hidden` attribute loses to CSS.** Any author `display` rule beats the browser's
  built-in `[hidden]`, so a flex or grid element with `hidden` stays visible. Components that
  toggle visibility pair it with an explicit `[hidden] { display: none }`. This caused the bug
  where the consultation form stayed on screen next to its own thank-you message.
- **Sanity is the source of truth for page content.** The `scripts/seed-*.ts` files were
  one-time migrations from the old hardcoded content. Don't re-run them expecting them to be
  authoritative.

---

## Known issues — none blocking

- **Wide-photo cropping on laptops.** The statement and Why Choose bands use 16:9 photos in a
  band fixed at 760px tall. Below about 1350px of browser width the photo is scaled to fill the
  height and cropped at the *sides*, which clips whoever is standing at the ends of the frame.
  Fix if it bothers you: `min-height: min(760px, 56.25vw)`, which ties the band's height to
  width instead. It makes the band shorter on narrow desktops, so it's a design call.
- **Team grid leaves a ragged row.** The band is a four-column grid and there are five people,
  so desktop shows four across and one alone. Either a three-column grid, or capping the
  homepage at four with a "view all" link, would tidy it.
- **Unused image assets.** `statement-team.jpg`, `whychoose-bg.jpg` and `team-group.png` are no
  longer referenced — roughly 2.5MB of dead weight in the repo.
- **Stale branches.** `qa`, `contact_form_bug`, `email_setup` and `docs` are all merged or
  superseded and can be deleted.
- **No test suite.** There's no test framework in the project. Verification is a build plus
  checking the deployed site.

---

See also `README.md` for local setup and `docs/sanity-integration.md` for the content model and
the decisions behind it.
