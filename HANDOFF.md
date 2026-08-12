# Cogdell Law Firm — site status & operating notes

**Prepared 12 August 2026.** The site is **live on the production domain**. Everything in the
"Confirmed working" table below was tested against `www.cogdell-law.com` directly, not
inferred from the code.

| | |
| --- | --- |
| Live site | `www.cogdell-law.com` — 200, apex 307s to `www` |
| Repo | `rhan-elitemktg/Cogdell-Law`, `master` at `0b035ee` |
| Vercel team | `elite-legal-marketing` |
| Search engines | Crawling enabled, 47 URLs in the sitemap |
| Consultation form | Needs one setting — see step 1 |

---

## Do these next — two things need a person

### 1. Point the consultation form at real inboxes

The form now sends from the verified Resend domain, but it still delivers to whatever single
address `CONSULT_TO_EMAIL` held before.

In **Vercel → Settings → Environment Variables**, edit that variable to:

```
rhan@elitemktg.com, phillip@elitemktg.com
```

It is marked *Sensitive*, so the current value is hidden — replace it wholesale rather than
appending. **Then redeploy.** Vercel bakes environment variables in at deploy time; changing
one alone does nothing until a new deployment goes out.

Submit the form and confirm:

- both addresses receive it
- the sender reads `Cogdell Law Firm <noreply@send.cogdell-law.com>`
- pressing Reply addresses the person who filled in the form, not the firm

Once you're satisfied, change the same variable to `info@cogdell-law.com` and redeploy again.
No code change is needed for that switch.

### 2. Remove the PageProofer review widget

The widget is still loading on the live site — confirmed present in the homepage HTML at
`www.cogdell-law.com`. It was a review tool for the build and shouldn't be on a public site.

Delete `PUBLIC_PAGEPROOFER_SITE_ID` in Vercel and redeploy. `Layout.astro` only renders the tag
when that variable is set, so removing it takes the script out of the HTML entirely — no code
change.

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
| Email delivery | Not tested — would send a real message | See step 1 |

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
| `CONSULT_TO_EMAIL` | Who receives leads. Accepts a comma-separated list. |

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
