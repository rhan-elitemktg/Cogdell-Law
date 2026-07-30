# Redirects — how to send an old URL to a new page

Use a redirect whenever a page's address changes or a page goes away. It sends
anyone who visits the old address — and Google — to the page you choose instead,
so you keep the rankings and the traffic the old page had earned.

You can do this yourself. No developer needed.

## Adding a redirect

1. In the Studio, go to **Site Settings → Global SEO Settings → Redirects**.
2. Click the **+** at the top of the Redirects list.
3. Fill in the three fields below.
4. Click **Publish**.

That's it. Nothing goes live until you hit Publish, so a half-finished redirect
sitting in your drafts can't affect the site.

### Old URL

The address that should redirect, starting with a slash:

```
/old-page-name
```

Just the path — not `https://www.cogdell-law.com/old-page-name`. Capitalisation
and a trailing slash don't matter, so `/Old-Page-Name/` works the same.

Leave off anything after a `?`. Tracking tags like `?utm_source=newsletter` are
carried through to the new page automatically.

### Redirect to

Where visitors should land. Either a page on this site:

```
/practice-areas/health-care-fraud-defense
```

or a full address to send them somewhere else entirely:

```
https://example.com/some-page
```

Point at the **final** destination, not at another page that itself redirects.

### Permanent

Leave this **ON** for anything that has moved or been replaced for good. That's
a 301, and it tells Google to pass the old page's ranking to the new one. This is
what you want almost every time.

Turn it **OFF** only for a temporary detour you intend to remove later. That's a
302, and it passes no ranking.

## When it goes live

Publishing rebuilds the site, so a new redirect is usually working within a few
minutes. Test it on the live site — redirects don't run on preview links.

## Messages you might see

The Studio checks your work as you type. Three things it will tell you:

**"Another redirect already uses this old URL."**
Two rules for the same address would be ambiguous, so this one blocks publishing.
Find the existing redirect in the list and edit that instead of adding a second.

**"This points at a URL that is itself redirected, creating a chain."**
You've sent A to B, but B already goes to C. Visitors still arrive, but every extra
hop loses a little ranking and slows Google down. Point straight at C.

**"…is a page that still exists."**
The address you typed is a live page on the site. A redirect here would take that
working page off the site, so it will be ignored and the page will keep working.
Usually this means a typo in the Old URL — check it before publishing.

## Changing or removing a redirect

Click any redirect in the list to edit it, then Publish. To remove one entirely,
open it and delete the document. Either way the change takes effect on the next
rebuild, same as adding one.

## What you can't do here

Ask a developer for any of these:

- **A whole folder at once** — e.g. sending every page under `/old-section/` to a
  new section in one rule. These have to be added in code.
- **Redirecting the homepage** (`/`).
- **Anything that depends on the visitor** — their country, their device, and so on.

## Rules of thumb

- Redirect to the **closest matching page**, not the homepage. Sending everything
  to `/` tells Google the old page's content is gone, and you lose its ranking.
- One hop, always. If you're replacing a page that already had a redirect pointing
  at it, update that older redirect too so it skips straight to the new page.
- Don't delete a redirect just because traffic to it dropped. Old links on other
  websites can keep sending people for years, and those links are worth keeping.
