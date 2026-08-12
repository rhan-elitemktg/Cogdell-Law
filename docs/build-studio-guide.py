#!/usr/bin/env python3
"""Builds docs/Cogdell-Law-Studio-Guide.pdf — the guide for everyone who uses the Studio.

The PDF is the deliverable; this is how it gets rebuilt when the Studio changes.

    python3 -m venv /tmp/guide-venv
    /tmp/guide-venv/bin/pip install reportlab
    /tmp/guide-venv/bin/python docs/build-studio-guide.py

Replaces the two guides that came before it — `build-content-guide.py` (for writers)
and `build-seo-guide.py` (for the SEO team). Two PDFs for one Studio meant whoever
opened the wrong one got half an answer, and the audiences overlap in both directions:
an SEO specialist writing a meta description needs the publishing rules, and a content
editor needs to know that renaming a slug without a redirect costs rankings. So: one
document, shared front matter, then Part One (content) and Part Two (SEO).

Layout, palette and helpers live in guide_kit.py. Read its docstring before changing
anything visual — in particular, stick to ASCII punctuation, because Helvetica renders
the fullwidth forms as solid black boxes.

── NO FACTS WITH A SHELF LIFE ────────────────────────────────────────────────────
This guide deliberately carries **no live content counts and no current-state
readings**. Not "20 practice areas", not "the crawl switch is currently off", not
"1 of 58 pages has a title written". Every one of those was true for about a week,
and a reference document that is subtly wrong is worse than one that never claimed
to know.

Where a count was doing real work, it is replaced by the check that produces it —
"crawl the site and sort by title" rather than "57 pages have no title". Where a
current state mattered, it is replaced by the rule — "this must be off on a live
site" rather than "this is off". The rule outlives the reading and is more useful.

**If you are tempted to add a number, ask whether it will still be true in six
months.** The counts that are safe are structural ones the schema guarantees (five
SEO fields, three redirect fields), because changing those means changing the code
that this guide is regenerated from.

What DOES need re-checking on a rebuild: every field label, description and
validation message quoted here is quoted verbatim from the schema, because editors
read those exact strings on screen. After any change to seo.ts, redirect.ts,
globalSeo.ts, firmDetails.ts or structure.ts, re-verify before shipping.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from guide_kit import Guide, GuideConfig  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "docs", "Cogdell-Law-Studio-Guide.pdf")

DOMAIN = "www.cogdell-law.com"
STUDIO = "cogdell-law.com/admin"
EDITION = "August 2026  ·  Version 2.0"

cfg = GuideConfig(
    out_path=OUT,
    firm_name="Cogdell Law Firm",
    cover_title=["The Studio", "Guide"],
    cover_subtitle="Writing the site, and making it rank",
    running_head="COGDELL LAW FIRM  ·  STUDIO GUIDE",
    pdf_title="Cogdell Law Firm — The Studio Guide",
    pdf_subject="Editing content and managing search for cogdell-law.com in "
                "Sanity Studio",
    edition=EDITION,
)

g = Guide(cfg)

# ── Contents ──────────────────────────────────────────────────────────────────
g.contents([
    "BEFORE YOU START",
    ("1", "What this is", "The Studio, and the one rule that governs everything"),
    ("2", "Signing in", "Getting in, and what to do if it won't let you"),
    ("3", "How the Studio is organised", "Three groups, and the whole map"),

    "PART ONE — CONTENT",
    ("4", "Editing something", "The loop you'll use ninety per cent of the time"),
    ("5", "Adding something new", "Only Collections can grow — and that's most of it"),
    ("6", "Removing something", "Unpublish hides it. Delete destroys it."),
    ("7", "Writing text", "The editor, and everything its toolbar can do"),
    ("8", "Adding images", "Upload once, and let the site do the work"),
    ("9", "The special blocks", "Banners and cards you can drop into a page"),
    ("10", "Putting things in order", "The lists you can drag, and what the rest do"),
    ("11", "Where everything lives", "If you know what you want to change, start here"),

    "PART TWO — SEO",
    ("12", "The SEO tab", "Five fields, and what each one really does"),
    ("13", "What Google sees by default",
     "The fallback chain, and how to find the pages that need work"),
    ("14", "Redirects", "Moving a URL without losing what it earned"),
    ("15", "The sitemap and robots.txt", "What's listed, what isn't, and why"),
    ("16", "Search Console and Bing", "Verifying, submitting, and what to watch"),
    ("17", "Structured data", "The markup this site emits, and the one field that breaks it"),
    ("18", "Pages you can create", "The content model as a ranking lever"),
    ("19", "Site-wide settings", "Two documents that affect every page at once"),

    "REFERENCE",
    ("20", "Please be careful with these", "The things that are hard to undo"),
    ("21", "What needs a developer", "So you don't waste an afternoon looking"),
    ("22", "Common questions", "Quick answers"),
])

# ── 1. What this is ───────────────────────────────────────────────────────────
g.section("1", "What this is",
          "The Studio, and the one rule that governs everything")

g.callout(
    "This guide covers two jobs, and you probably only do one of them.",
    "<b>Part One</b> is for the people who write and update the words. <b>Part "
    "Two</b> is for the people who look after how the site performs in search. "
    "Neither part assumes you can code. Read the three sections before the split, "
    "then go to your part — but skim the other one, because the two jobs collide "
    "more than you'd think.",
    "tip",
)

g.p(
    "Every word, image, headline, phone number and meta description on this site "
    "is stored in a system called <b>Sanity Studio</b>. The website itself has no "
    "content of its own. It asks the Studio what to say, and prints it."
)
g.p(
    "So you can change anything on the site without a developer. It also means a "
    "change you make in the Studio is a change to the live website."
)

g.h2("The one rule")
g.p(
    "Your work is private until you press <b>Publish</b>. Type as much as you like, "
    "save drafts, come back tomorrow — nobody sees any of it. The moment you "
    "publish, the website rebuilds itself and your change goes live to the public a "
    "couple of minutes later."
)
g.callout(
    "\"Rebuilds itself\" is not a figure of speech.",
    "Every page of this site is generated in advance, which is why it loads as fast "
    "as it does. A publish doesn't update one page — it regenerates all of them, "
    "along with <b>sitemap.xml</b>, <b>robots.txt</b> and the redirect table. That "
    "is why an SEO change or a new redirect goes live with nobody deploying "
    "anything, and it is also why nothing you change is instant. Give it two or "
    "three minutes before you check.",
    "note",
)

with g.keep():
    g.h2("What you can and can't do")
    g.p("You can:")
    g.bullets([
        "Change any words or images on any page",
        "Add team members, practice areas, city pages, testimonials, news, podcast "
        "episodes, videos and FAQs",
        "Remove or hide things you no longer want",
        "Reorder the lists that appear on the site",
        "Set the title and description that show up in Google, and hide a page "
        "from it",
        "Add and edit redirects, with no developer involved",
    ])
    g.space(4)
    g.p("You can't (and shouldn't need to):")
    g.bullets([
        "Create a brand-new type of page — the page designs are built in code",
        "Change colours, fonts or layout",
        "Delete one of the main pages — they're locked so nobody can remove them "
        "by accident",
        "Paste in a tracking script or a verification tag — see section 21",
    ])

# ── 2. Signing in ─────────────────────────────────────────────────────────────
g.section("2", "Signing in", "Getting in, and what to do if it won't let you")

g.p(
    "The Studio lives at the website's own address with <b>/admin</b> on the end:"
)
g.code(STUDIO)
g.steps([
    "Bookmark that address. You'll use it every time.",
    "Choose the sign-in method you were invited with — usually Google, or an email "
    "and password.",
    "The first time, you may be asked to allow the Studio access to your account. "
    "That's normal; approve it.",
])

g.h2("If it won't let you in")
g.p(
    "The Studio only opens for people who have been <b>invited to the project</b>. "
    "Signing in with an account nobody has invited will get you a polite refusal, "
    "not an error — it isn't a broken password. Ask whoever manages the site to "
    "send you an invitation, and make sure you sign in with the same email address "
    "the invitation went to."
)
g.callout(
    "Use one account, and keep it to yourself.",
    "The Studio records who changed what. Sharing a login makes that history "
    "useless, and it's the first thing anyone looks at when a page changes "
    "unexpectedly — or when a page's traffic falls off a cliff and nobody knows "
    "why. If someone new needs access, have them invited properly.",
    "warn",
)

# ── 3. How the Studio is organised ────────────────────────────────────────────
g.section("3", "How the Studio is organised", "Three groups, and the whole map")

g.p(
    "When you sign in you'll see a column on the left headed <b>Content</b>, with "
    "three entries. Everything in the Studio sits inside one of them."
)
g.table(
    ["GROUP", "WHAT'S IN IT", "CAN YOU ADD TO IT?"],
    [
        ["Pages",
         "One entry per fixed page of the site — Home Page, Contact Page, Our Firm "
         "Page and so on — plus a <b>Legal</b> folder holding the Privacy Policy "
         "and Disclaimer.",
         "No. Exactly one of each, and none can be deleted."],
        ["Collections",
         "The things there are lots of: team member bios, practice areas, service "
         "cities, location pages, testimonials, news, podcast episodes, videos, "
         "FAQs and trial results.",
         "Yes. This is where the site grows."],
        ["Site Settings",
         "Firm Details, Call-to-Action Bar, Consultation Form, Fact-Checked "
         "Banner, and <b>Global SEO Settings</b>.",
         "No, but everything in here affects every page at once."],
    ],
    [0.17, 0.49, 0.34],
)

g.h2("Two things worth finding now")
g.p(
    "Whichever job you're here for, these are the two you'll come back to:"
)
g.bullets([
    "<b>The SEO tab</b> — across the top of most records, next to Content. Part Two "
    "is mostly about what's on it.",
    "<b>Site Settings &rarr; Global SEO Settings</b> — opens into <b>Defaults</b> "
    "(the crawl switch and the site-wide share image) and <b>Redirects</b> (the "
    "full list, sorted by old URL).",
])

g.h2("Which records have an SEO tab")
g.p(
    "Only the ones that have a page of their own. Open a record and you'll see tabs "
    "across the top of the form — <b>Content</b> (or <b>Card</b>) and <b>SEO</b>."
)
g.table(
    ["HAS AN SEO TAB", "WHERE"],
    [
        ["Every fixed page", "Pages — Home, Trial Experience, Testimonials, Team "
                             "Members, Our Firm, Practice Areas, News, Podcast, "
                             "Videos, Contact"],
        ["Privacy Policy and Disclaimer", "Pages &rarr; Legal"],
        ["Practice Areas", "Collections"],
        ["Location Pages", "Collections"],
        ["Team Member Bios", "Collections"],
        ["News Articles", "Collections — but see the warning below"],
        ["Podcast Episodes", "Collections"],
    ],
    [0.32, 0.68],
)
g.callout(
    "An SEO tab on an external news item does nothing.",
    "A News Article set to <b>\"Links to external coverage\"</b> is a link out to "
    "somebody else's website. It has no page here, so there is no title tag to set "
    "and it never appears in the sitemap. It still shows an SEO tab, because the "
    "tab belongs to the record type rather than to that setting. Only items set to "
    "<b>\"Full article on our site\"</b> get a real page.",
    "warn",
)
g.p(
    "<b>Service Cities, Videos, FAQs, Testimonials and Trial Results</b> have no "
    "SEO tab because they are ingredients rather than pages — they appear inside "
    "other pages, so the metadata belongs to whatever page renders them. The site "
    "map page and the 404 page have no editable metadata either; their titles are "
    "set in code, and the 404 is already marked not to be indexed."
)

# ═══════════════════════════════════════════════════════════════════════════════
# PART ONE — CONTENT
# ═══════════════════════════════════════════════════════════════════════════════
g.part("Part One", "Content", "Writing, adding and publishing")

# ── 4. Editing something ──────────────────────────────────────────────────────
g.section("4", "Editing something",
          "The loop you'll use ninety per cent of the time")

g.steps([
    "Find what you want to change. <b>Pages &rarr; Contact Page</b>, or "
    "<b>Collections &rarr; Team Member Bios &rarr; Dan L. Cogdell</b>.",
    "Change it. There is no Save button — your typing is kept as you go.",
    "Click <b>Publish</b>.",
    "Wait two or three minutes, then look at the live site.",
])

g.h2("Reading the editor")
g.table(
    ["WHAT YOU SEE", "WHAT IT MEANS"],
    [
        ["Tabs across the top",
         "One record split into sections — usually <b>Content</b> and <b>SEO</b>, "
         "sometimes <b>Card</b>, <b>Page</b> or <b>Meta</b>. They are all one "
         "record and one Publish; the tabs just stop the form being enormous."],
        ["Grey text under a field",
         "A note from whoever built the site, explaining what the field is for. "
         "Worth reading — most questions are answered there."],
        ["A red message",
         "Something required is missing or invalid. This blocks publishing until "
         "you fix it."],
        ["An orange message",
         "A suggestion, almost always about length. You can publish anyway."],
        ["Publish greyed out",
         "Either nothing has changed since the last publish, or something required "
         "is empty. Scroll for a red message."],
    ],
    [0.24, 0.76],
)

with g.keep():
    g.h2("Changing your mind")
    g.p(
        "<b>Before you publish</b>, the menu beside the Publish button will discard "
        "your draft and put the record back as it was."
    )
    g.p(
        "<b>After you publish</b>, every record keeps its own history — who changed "
        "what, when, and what the previous version said. A past version can be "
        "restored. If you are not sure, ask before clicking rather than after."
    )
    g.callout(
        "Publish when you're finished, not as you go.",
        "Every publish rebuilds the whole site. Making ten small changes to a page "
        "and publishing once is better for everyone than publishing ten times — and "
        "it leaves a history that is readable later.",
        "tip",
    )

# ── 5. Adding something new ───────────────────────────────────────────────────
g.section("5", "Adding something new",
          "Only Collections can grow — and that's most of what you'll add")

g.steps([
    "Open the collection — for example <b>Collections &rarr; Testimonials</b>.",
    "Click the <b>+</b> at the top of the list.",
    "Fill in the fields. Anything required will tell you so in red.",
    "Click <b>Publish</b>.",
])
g.p(
    "The <b>Pages</b> and <b>Site Settings</b> groups don't work this way — there "
    "is exactly one of each and no way to add another. That is deliberate; a second "
    "Home Page would be invisible to the site and confusing forever after."
)

g.h2("About slugs")
g.p(
    "A slug is the part of the web address that identifies the page. This bio:"
)
g.code("cogdell-law.com/our-team/osso-anthony")
g.p(
    "has the slug <b>osso-anthony</b>. Use the <b>Generate</b> button beside the "
    "field and it will build one from the title. Lower-case letters and hyphens "
    "only — no spaces, no capitals, no punctuation."
)
g.callout(
    "Changing a slug on a live page breaks every link to it.",
    "Bookmarks, Google results and links from other websites all stop working, and "
    "the page loses what it had earned. You don't need a developer to fix this — "
    "<b>add a redirect from the old address to the new one</b> and publish them "
    "together. Section 14 is the whole procedure, and it takes about a minute.",
    "warn",
)

g.h2("Things that reference other things")
g.p(
    "Some fields point at another record rather than holding their own text. A "
    "location page picks its <b>Service City</b>; a practice area can pick the "
    "attorney who <b>reviewed</b> it; a sub-topic picks its <b>Parent</b>. If what "
    "you want isn't in the list, it doesn't exist yet — create it first, publish "
    "it, then come back."
)

# ── 6. Removing something ─────────────────────────────────────────────────────
g.section("6", "Removing something", "Unpublish hides it. Delete destroys it.")

g.table(
    ["OPTION", "WHAT HAPPENS", "WHEN TO USE IT"],
    [
        ["Unpublish", "Comes off the website. Stays in the Studio, and can be "
                      "published again at any time.",
         "Almost always. It is the reversible one."],
        ["Delete", "Gone from the Studio as well. Not recoverable.",
         "Duplicates and test entries you are certain about."],
    ],
    [0.15, 0.45, 0.40],
)
g.p("Both live in the menu beside the Publish button.")

g.callout(
    "If something else is pointing at it, the Studio will stop you.",
    "Try to delete an attorney who is named as the reviewer on three practice-area "
    "pages, or who appears in an Attorney Card inside a page body, and you'll get a "
    "warning listing exactly where. Fix those references first — that warning is "
    "protecting the pages, not being difficult.",
    "warn",
)

g.h2("A gentler option: featuring")
g.p(
    "Testimonials carry a <b>Feature on the homepage</b> switch. Turned off, the "
    "quote stays on the testimonials page and simply stops appearing in the "
    "featured band. <b>Only three</b> can be featured at once — the band is three "
    "across — and the Studio will tell you to unfeature one before adding another. "
    "That band appears on the homepage and on the team page."
)

# ── 7. Writing text ───────────────────────────────────────────────────────────
g.section("7", "Writing text", "The editor, and everything its toolbar can do")

g.p(
    "The longer fields — an attorney's biography, a practice-area body, an FAQ "
    "answer, the Privacy Policy — use a formatting toolbar. It is deliberately "
    "small: everything on it is styled to match the site, and there is nothing on "
    "it that can make a page look wrong."
)
g.table(
    ["CONTROL", "WHAT IT'S FOR"],
    [
        ["Normal", "Ordinary paragraph text. Most of what you write."],
        ["Heading 2, 3, 4",
         "Section headings inside the text. <b>Heading 2</b> for main sections, "
         "<b>3</b> and <b>4</b> beneath it. There is no Heading 1 — the page's own "
         "title is already the top-level heading, and a second one confuses search "
         "engines."],
        ["Quote", "A pulled-out quotation with a decorative mark."],
        ["Bold, Italic", "Emphasis inside a paragraph. Use sparingly."],
        ["Link",
         "Select the words first. For a page on this site type the path only — "
         "<b>/contact</b>. For anywhere else use the full address starting "
         "<b>https://</b>. Email and phone links work too: <b>mailto:</b> and "
         "<b>tel:</b>."],
        ["Bulleted, Numbered list",
         "Numbered when the order matters or the steps are sequential; bulleted "
         "otherwise."],
    ],
    [0.20, 0.80],
)
g.callout(
    "Don't paste straight from Word or Google Docs.",
    "It carries invisible formatting that fights with the site's own styling. Paste "
    "as plain text — <b>Cmd+Shift+V</b> on a Mac, <b>Ctrl+Shift+V</b> on Windows — "
    "then apply headings and bold in the Studio.",
    "warn",
)

# ── 8. Adding images ──────────────────────────────────────────────────────────
g.section("8", "Adding images", "Upload once, and let the site do the work")

g.p(
    "Drag a file onto an image field, or click to browse. The site then generates "
    "every size it needs and serves each visitor the smallest one that still looks "
    "sharp — so <b>always upload the largest, best-quality version you have</b>. "
    "You cannot make a photo better later, but the site can always make it smaller."
)

g.h2("The hotspot")
g.p(
    "The same photograph gets cropped differently in different places — square on a "
    "card, tall in a sidebar, wide across a band. Click <b>Edit hotspot</b> (the "
    "crop icon) and drag the circle over the part that must never be cut off. On a "
    "person, that is their face."
)

g.h2("Alt text")
g.p(
    "Describe what the picture shows, in a plain sentence, as if to someone who "
    "can't see it:"
)
g.code("Dan Cogdell speaking to reporters outside the courthouse")
g.p(
    "Not \"photo\", not \"IMG_4821\", and not a list of keywords. Alt text is read "
    "aloud by screen readers and read by Google, and keyword-stuffing it is both "
    "obvious and counterproductive."
)
g.callout(
    "Blank is sometimes the right answer.",
    "If an image is purely decorative — a background texture, an abstract shape — "
    "leaving alt text empty is correct. It tells a screen reader to skip it rather "
    "than read out something meaningless.",
    "tip",
)

# ── 9. The special blocks ─────────────────────────────────────────────────────
g.section("9", "The special blocks",
          "Banners and cards you can drop into a page")

g.p(
    "On <b>Practice Areas</b> and <b>Location Pages</b> only, the body field takes "
    "more than text. Between any two paragraphs there is an <b>Insert</b> or "
    "<b>+</b> control offering five designed sections. They can be dragged up and "
    "down like anything else in the body."
)
g.table(
    ["BLOCK", "WHAT IT LOOKS LIKE"],
    [
        ["CTA Banner",
         "A dark band with a heading, an optional supporting line and up to two "
         "buttons. Leave the buttons empty and it uses the standard pair; leave the "
         "supporting line empty for a tighter heading-and-buttons version."],
        ["Get In Touch Bar",
         "A slim bar — a short heading on the left, a large phone number on the "
         "right. The number is optional and falls back to the one in Firm Details, "
         "so only fill it in for a page advertising its own local line."],
        ["Attorney Card",
         "Pick an attorney; the site pulls their photo and details. You write a "
         "short passage about this page's subject, and get the same two buttons."],
        ["Attorney Quote",
         "Pick an attorney and write a quotation in their voice, with their "
         "portrait alongside. The sibling of the Attorney Card — that one "
         "introduces them, this one quotes them."],
        ["Client Testimonial",
         "Pick an existing testimonial. It stays linked to the original, so editing "
         "the quote once updates it everywhere."],
    ],
    [0.20, 0.80],
)
g.callout(
    "These blocks only exist on those two page types.",
    "Team member bios, FAQ answers, news articles and the legal pages are plain "
    "text by design — a call-to-action banner has no business inside an FAQ "
    "answer.",
    "note",
)
g.p(
    "Used sparingly they break up a long page and give a reader somewhere to act. "
    "Three banners in a row is worse than none."
)

# ── 10. Putting things in order ───────────────────────────────────────────────
g.section("10", "Putting things in order",
          "The lists you can drag, and what the rest do")

g.p(
    "Seven collections are drag-to-reorder: grab the handle at the left of a row "
    "and move it. What you see in the Studio is the order the site renders."
)
g.bullets([
    "<b>Team Member Bios</b> — the order people appear on the homepage and on "
    "<b>/our-team</b>.",
    "<b>Practice Areas</b> — the navigation menu and the practice-area cards.",
    "<b>Service Cities</b> — how cities are grouped in the areas-we-serve menu.",
    "<b>Location Pages</b> — the order within each city.",
    "<b>Videos</b> — the videos page.",
    "<b>FAQs</b> — the order the questions are answered in.",
    "<b>Testimonials</b> — the wall on the testimonials page, and the running "
    "order of the featured band.",
])
g.p("The other three collections are not dragged:")
g.table(
    ["COLLECTION", "HOW IT'S ORDERED"],
    [
        ["News Articles", "Newest first, by the <b>Published date</b> on the record."],
        ["Podcast Episodes", "Newest first, the same way."],
        ["Trial Results",
         "Curated on <b>Pages &rarr; Trial Experience Page</b>, which chooses which "
         "cases appear and in what order."],
    ],
    [0.24, 0.76],
)
g.callout(
    "A new record lands at the bottom.",
    "Add an attorney or a practice area and it appears last in the list, and last "
    "on the site. Dragging it into place is a separate step, and it's the one "
    "people forget.",
    "tip",
)

# ── 11. Where everything lives ────────────────────────────────────────────────
g.section("11", "Where everything lives",
          "If you know what you want to change, start here")

g.h2("Pages")
g.table(
    ["OPEN THIS", "TO CHANGE"],
    [
        ["Home Page",
         "The whole homepage, section by section: the hero, selling points, "
         "practice-area band, About, Statement Band, attorneys, firm story, "
         "testimonials, Why Choose, Practice Reach, Press, FAQ and news band — plus "
         "a CTA Bar override."],
        ["Trial Experience Page",
         "The page's heading and wording, <b>and which trial results appear and in "
         "what order</b>. The cases themselves live in Trial Results."],
        ["Testimonials Page",
         "Headings and intro, the testimonials wall, a practice-areas band and a "
         "CTA Bar override."],
        ["Team Members Page",
         "Hero, the attorneys band, a testimonials band and a Why Choose band. The "
         "people themselves are in <b>Team Member Bios</b>."],
        ["Our Firm Page",
         "Hero, intro, stats, quote band, founding attorney, origin story with its "
         "milestones, and the values cards."],
        ["Practice Areas Page", "The hero of the practice-areas index. The areas "
                                "are in Collections."],
        ["News Page", "The hero and the news grid's wording."],
        ["Podcast Page", "The podcast hero. Episodes are in Collections."],
        ["Videos Page", "The hero and the video grid's wording."],
        ["Contact Page",
         "<b>The hero only.</b> The consultation form's wording is in <b>Site "
         "Settings &rarr; Consultation Form</b>, not here."],
        ["Legal &rarr; Privacy Policy", "The privacy policy."],
        ["Legal &rarr; Disclaimer", "The disclaimer."],
    ],
    [0.24, 0.76],
)

g.h2("Collections")
g.table(
    ["OPEN THIS", "TO CHANGE"],
    [
        ["Team Member Bios",
         "Name, slug, <b>team group</b> (Attorney or Paralegal — it decides which "
         "heading they sit under in the menu), role, card blurb, photo and its alt "
         "text, phone, email, practice tags, biography, education, bar admissions, "
         "honours, classes and seminars, published works, associations, past "
         "positions and representative cases. Gives them a page at "
         "<b>/our-team/&lt;slug&gt;</b>."],
        ["Practice Areas",
         "Three tabs — Card, Page and SEO. The <b>Parent</b> field nests an area "
         "under another and builds its address. Also the icon, hero image, body, "
         "FAQs, an optional <b>Reviewed by</b> attorney (falling back to the "
         "default reviewer in Firm Details) and a per-page Fact-Checked Banner "
         "override."],
        ["Service Cities",
         "A city name and its URL segment. A grouping label — it has no page of its "
         "own."],
        ["Location Pages",
         "Picks its city, then carries its own title, <b>nav label</b>, slug, hero, "
         "lede, body, FAQs and Fact-Checked override. Lands at "
         "<b>/&lt;city&gt;/&lt;slug&gt;</b>."],
        ["Videos", "Title plus the Wistia ID. The thumbnail and running time come "
                   "from Wistia automatically."],
        ["FAQs", "The site-wide FAQ band. Practice areas and location pages keep "
                 "their own FAQs on the page itself."],
        ["Testimonials",
         "The quote, attribution, an optional date and tag, and the <b>Feature on "
         "the homepage</b> switch — maximum three."],
        ["News Articles",
         "Headline, slug, outlet and its logo, media type (Article, Video or "
         "Podcast — it decides whether the card says Read, Watch or Listen), "
         "summary, button label, and the <b>This item</b> field that decides "
         "whether this is a link out or a full article here. Published date is on "
         "the Meta tab."],
        ["Podcast Episodes",
         "Episode title, number, slug, tag, published date, summary, show notes, "
         "the Spotify link, an optional artwork background photo, and the chapter "
         "list — where every line must start with a timestamp or it won't publish."],
        ["Trial Results",
         "Case name, outcome, write-up, the <b>filter group</b> it belongs to and "
         "its <b>badge</b> — two independent fields — plus an optional shorter "
         "version for the homepage."],
    ],
    [0.20, 0.80],
)

with g.keep():
  g.h2("Site Settings")
  g.table(
    ["OPEN THIS", "TO CHANGE"],
    [
        ["Firm Details",
         "Firm name, tagline, phone, email, office address, social links, logo, "
         "copyright line, footer legal links, and the <b>default reviewer</b> "
         "credited on practice-area pages that don't name their own. Read by search "
         "engines as well as people — section 19."],
        ["Call-to-Action Bar", "The default band shown on every page. Individual "
                               "pages can override it."],
        ["Consultation Form", "The wording around the consultation form, including "
                              "on the contact page."],
        ["Fact-Checked Banner", "The badge and statement at the foot of practice-area "
                                "and location pages. Each page can override it or "
                                "switch it off."],
        ["Global SEO Settings",
         "A folder, not a document. <b>Defaults</b> holds the crawl switch and the "
         "site-wide share image; <b>Redirects</b> holds the redirect list. Sections "
         "14 and 19."],
    ],
    [0.24, 0.76],
  )

# ═══════════════════════════════════════════════════════════════════════════════
# PART TWO — SEO
# ═══════════════════════════════════════════════════════════════════════════════
g.part("Part Two", "SEO", "Metadata, redirects and how the site is found")

# ── 12. The SEO tab ───────────────────────────────────────────────────────────
g.section("12", "The SEO tab", "Five fields, and what each one really does")

g.p(
    "Every field is optional, and leaving one empty is a legitimate answer — the "
    "site falls back to something sensible (section 13). Nothing here can block a "
    "publish: the length rules are <b>warnings</b>, so a 64-character title will "
    "grumble at you and publish anyway."
)
g.callout(
    "That is on purpose, and worth knowing.",
    "Publishing is what rebuilds the site. If a character-count rule could block a "
    "publish, one over-long title would stop the whole site from rebuilding — "
    "including everyone else's unrelated changes. So the counts advise; they never "
    "veto. The one exception is redirects, where the rules do block, for reasons "
    "section 14 explains.",
    "note",
)

g.h3("Meta title")
g.p(
    "The clickable line in search results and the text in the browser tab. Around "
    "60 characters; over that you'll see <i>\"Titles over ~60 characters get "
    "truncated in search results.\"</i>"
)
g.p(
    "<b>Do not type the firm name.</b> The site appends <b>&nbsp;| Cogdell "
    "Law</b> to every title automatically. Write <i>Federal Health Care Fraud "
    "Defense</i> and the page ships as <i>Federal Health Care Fraud Defense | "
    "Cogdell Law</i>. Those 12 trailing characters count towards your 60."
)
g.callout(
    "One genuine trap.",
    "If you type exactly <b>Cogdell Law</b> as a meta title, the suffix is "
    "suppressed and the page ships with a bare <b>Cogdell Law</b> title. That "
    "behaviour exists so the homepage isn't called \"Cogdell Law | Cogdell Law\" — "
    "but it fires on any page, not just the homepage. If you ever want a title "
    "that is just the brand, that's how; if you didn't want it, that's why.",
    "warn",
)

g.h3("Meta description")
g.p(
    "The grey summary underneath. Around 160 characters, warned about but never "
    "blocked. Leave it empty and the page uses its own opening line — which for "
    "most page types is a real, human-written sentence rather than a machine one "
    "(section 13)."
)
g.p(
    "Write for a person. A description that reads like a sentence somebody would "
    "actually say outperforms one stuffed with \"Houston criminal defense attorney "
    "lawyer Houston TX\", and has done for over a decade."
)

g.h3("Canonical URL")
g.p(
    "Leave this blank. Every page already declares itself canonical at its own "
    "address, which is correct for a site with no duplicate content, no printer "
    "versions and no parameters. Fill it in only for a page that genuinely "
    "duplicates another."
)
g.callout(
    "Setting this also changes the social share URL.",
    "The canonical value is reused as the page's <b>og:url</b>, so a wrong entry "
    "doesn't just misdirect Google — it makes every Facebook and LinkedIn share of "
    "that page point somewhere else. Getting it wrong is one of the few things in "
    "this Studio that can remove a page from search results.",
    "warn",
)

g.h3("Hide from search engines")
g.p(
    "A switch. On, and the page carries <b>noindex, nofollow</b> and drops out of "
    "sitemap.xml. The page stays live and reachable by anyone with the link — this "
    "hides a page from search, it does not take it down."
)
g.p(
    "Reach for it on a landing page built for a paid campaign, a thin page you're "
    "not ready to have indexed, or something duplicated for a specific audience."
)

g.h3("Social share image")
g.p(
    "The picture used when the page is shared on Facebook, LinkedIn or X. Upload at "
    "<b>1200 x 630</b>; anything else is cropped to that shape rather than "
    "letterboxed, so set the hotspot after uploading and check the crop preview."
)
g.p(
    "Leave it empty and the page uses the site-wide default from Global SEO "
    "Settings. Override it when a specific page deserves its own."
)
g.callout(
    "No alt text, by design.",
    "There is no alt-text field for the share image, and the site emits no "
    "<b>og:image:alt</b>. Social platforms don't display it and search engines "
    "don't index it — the image is decoration on a card, not content. If that "
    "changes, it's a developer job.",
    "note",
)

# ── 13. Fallbacks ─────────────────────────────────────────────────────────────
g.section("13", "What Google sees by default",
          "The fallback chain, and how to find the pages that need work")

g.p(
    "This is the section that tells you where writing a title actually changes "
    "something. Because the fallbacks are good, some pages need no work at all, and "
    "others are shipping a title that is a bare two-word heading."
)

g.h2("The rule")
g.bullets([
    "<b>Title</b>: your Meta title, or else the page's own heading — then "
    "<b>&nbsp;| Cogdell Law</b> is appended either way.",
    "<b>Description</b>: your Meta description, or else the summary field listed "
    "below. If neither exists, the page ships with <b>no description at all</b> and "
    "Google writes its own from the page text.",
    "<b>Canonical</b>: your Canonical URL, or else the page's own address with no "
    "trailing slash.",
    "<b>Share image</b>: the page's, or else the site-wide default.",
])
g.p("A field containing only spaces counts as empty.")

g.h2("Where each page type gets its fallback")
g.table(
    ["PAGE TYPE", "TITLE FALLS BACK TO", "DESCRIPTION FALLS BACK TO"],
    [
        ["Practice areas", "The <b>Title</b> field",
         "The <b>Card summary</b> field — the same sentence that appears on the "
         "practice-area grid card. If empty: a generated \"Title — Cogdell Law "
         "Firm.\""],
        ["Location pages", "The <b>Title</b> field",
         "The <b>Lede</b> field. If empty: the same generated line."],
        ["Team member bios", "The person's <b>Name</b>",
         "Generated — \"Name, Role at Cogdell Law Firm.\" followed by the first "
         "paragraph of the bio."],
        ["Podcast episodes", "Episode title with the number",
         "The <b>Summary</b> field, else a generated podcast line."],
        ["News articles (owned)", "The <b>Headline</b>",
         "The <b>Summary</b> field, else the generated line."],
        ["Homepage", "Its own heading",
         "<b>Nothing.</b> The homepage has no description fallback — empty the "
         "field and it ships without one."],
        ["The other fixed pages", "A short built-in name — \"Practice Areas\", "
         "\"Our Attorneys\", \"Contact\"",
         "A built-in sentence written when the page was built."],
    ],
    [0.20, 0.30, 0.50],
)

g.callout(
    "Where the wins usually are.",
    "The bios and the generated lines are the weak spot: a bio's description is "
    "assembled mechanically, and any practice area with an empty <b>Card summary</b> "
    "ships a description that is just its own title repeated. Practice areas and "
    "location pages usually have real summary sentences already — so they're a "
    "rewrite job, not a blank page.",
    "tip",
)

g.h2("How to see where you stand")
g.p(
    "There is no report in the Studio that lists which pages have had a title "
    "written and which are running on a fallback — from the inside, an inherited "
    "title looks exactly like a deliberate one. Find them from the outside instead:"
)
g.steps([
    "Crawl the site with any SEO crawler — Screaming Frog, Sitebulb, Ahrefs — "
    "starting from <b>" + DOMAIN + "/sitemap.xml</b>.",
    "Sort by title. Anything that is a bare two or three words, or that repeats a "
    "heading verbatim, is running on the fallback.",
    "Sort by meta description and look for the pattern <i>\"Something — Cogdell Law "
    "Firm.\"</i> — that exact shape is the generated line, which means neither a "
    "meta description nor a summary field was written.",
    "Look for duplicates. Two pages sharing a title is almost always two practice "
    "areas whose headings are near-identical, and the fix is a written title on "
    "both.",
])
g.p(
    "That list is your queue, and it stays accurate — which is more than can be "
    "said for any count printed in a guide."
)

g.h2("What every page carries, and what it doesn't")
g.p(
    "So you know what to expect before you open a page source or a crawler report."
)
g.table(
    ["ON EVERY PAGE", "NOT ON ANY PAGE"],
    [
        ["Title, canonical link, and description when one resolves",
         "No <b>index, follow</b> tag — a page with no robots tag is the normal, "
         "indexable case"],
        ["Open Graph title, description, url, image, site name",
         "No <b>og:image:alt</b>, no image width or height"],
        ["Twitter card tags — large image when a share image resolves, summary "
         "when not",
         "No <b>article:published_time</b> or author tags, even on news and podcast "
         "pages"],
        ["Business structured data (section 17)",
         "No hreflang and no locale tag — the site is single-language, English, "
         "declared once in the page"],
        ["<b>og:type</b> of \"website\"",
         "On every page, articles included. Changing it per page type is a "
         "developer job"],
    ],
    [0.50, 0.50],
)

# ── 14. Redirects ─────────────────────────────────────────────────────────────
g.section("14", "Redirects", "Moving a URL without losing what it earned")

g.p(
    "Redirects on this site are content, not code. You add them yourself, they go "
    "live on the next publish, and no developer is involved. That is deliberate — "
    "the whole redirect table was handed to this team on purpose."
)

g.h2("Adding one")
g.steps([
    "Go to <b>Site Settings &rarr; Global SEO Settings &rarr; Redirects</b>.",
    "Click the <b>+</b> at the top of the list.",
    "Fill in the three fields below.",
    "Click <b>Publish</b>.",
])

g.h3("Old URL")
g.p("The path that should redirect, starting with a slash:")
g.code("/old-page-name")
g.bullets([
    "Just the path — not the full web address.",
    "Capitalisation and a trailing slash don't matter. <b>/Old-Page-Name/</b> and "
    "<b>/old-page-name</b> are the same rule.",
    "Leave off anything after a <b>?</b>. Query strings, including tracking tags "
    "like <b>?utm_source=newsletter</b>, are carried through to the destination "
    "automatically.",
])

g.h3("Redirect to")
g.p("Either a path on this site or a full address somewhere else:")
g.code("/practice-areas/health-care-fraud-defense")
g.p("Point at the <b>final</b> destination, never at another page that redirects again.")

g.h3("Permanent")
g.p(
    "Leave it <b>on</b> for anything moved or replaced for good — that's a 301, and "
    "it passes the old page's ranking to the new one. This is what you want almost "
    "every time. Turn it <b>off</b> only for a temporary detour you intend to "
    "remove; that's a 302, and it passes nothing."
)

g.h2("What the Studio will refuse, and what it will merely grumble about")
g.p(
    "Redirects are the one place in this Studio where a validation error genuinely "
    "blocks publishing. A bad redirect can take a working page off the site, and "
    "blocking one document is much cheaper than that."
)
g.table(
    ["BLOCKS PUBLISHING", "WHAT IT MEANS"],
    [
        ["\"Enter just the path, not the full web address\"",
         "You pasted an https:// address into <b>Old URL</b>. Strip it back to the "
         "path."],
        ["\"A URL can't contain spaces\"",
         "Usually a stray space from a spreadsheet paste. Either field."],
        ["\"The old URL has to start with a slash\"", "Add the leading slash."],
        ["\"The homepage can't be redirected\"",
         "You entered <b>/</b>. This one needs a developer, and almost certainly "
         "isn't what you wanted."],
        ["\"Leave off the ? and anything after it\"",
         "Query strings are preserved automatically — the rule matches on the path "
         "alone."],
        ["\"Another redirect already uses this old URL\"",
         "Two rules for one address would be ambiguous. Find the existing one in "
         "the list and edit it."],
        ["\"Use a path starting with a slash, or a full address starting with "
         "https://\"",
         "The <b>Redirect to</b> value is neither. Off-site destinations need the "
         "full https:// address."],
        ["\"This redirects the page to itself, which would loop forever\"",
         "Old URL and Redirect to are the same address."],
    ],
    [0.42, 0.58],
)

g.table(
    ["WARNS ONLY", "WHAT IT MEANS"],
    [
        ["\"...is a page that still exists\"",
         "The old URL is a live page. The redirect will be <b>silently ignored</b> "
         "when the site builds, so the page keeps working. Almost always a typo in "
         "the Old URL."],
        ["\"...looks like a page that still exists\"",
         "The last part of the path matches a live bio, article, episode or practice "
         "area. Check it before publishing — the Studio can't be certain, but it's "
         "usually right."],
        ["\"...points at a URL that is itself redirected, creating a chain\"",
         "You've sent A to B, but B already goes to C. Visitors still arrive; every "
         "hop leaks a little ranking and burns crawl budget. Point A straight at C."],
    ],
    [0.42, 0.58],
)

g.callout(
    "A redirect can never take a live page off this site.",
    "That guard is built in twice: the Studio warns you as you type, and the build "
    "drops any rule whose old URL is a real page. The cost is that a mistyped "
    "redirect fails quietly — it publishes fine and simply never fires. If a "
    "redirect \"doesn't work\", check the Old URL against the live site first.",
    "note",
)

g.h2("Things the redirect table does for you")
g.bullets([
    "<b>Both slash forms are covered.</b> Add <b>/old-page</b> and the build also "
    "emits <b>/old-page/</b>. The URLs inherited from the site's previous host all "
    "ended in a slash, so it matters more here than most places. You only ever type "
    "one form.",
    "<b>Query strings are preserved.</b> Campaign tags survive the hop.",
    "<b>The list is sorted by old URL</b>, not by when it was added, so finding an "
    "existing rule is a scan rather than a search.",
])

with g.keep():
    g.h2("Rules of thumb")
    g.bullets([
        "Redirect to the <b>closest matching page</b>, not the homepage. Sending "
        "everything to <b>/</b> tells Google the old content is gone, and the "
        "ranking goes with it.",
        "One hop, always. If you're replacing a page that already had a redirect "
        "pointing at it, update that older rule too so it skips straight to the new "
        "destination.",
        "Add the redirect in the same sitting as the slug change. See section 20.",
    ])

g.h2("Testing one")
g.callout(
    "Redirects only work on the live site.",
    "They are applied by the host, not by the site itself, which means they do not "
    "run on a local copy <b>and do not run on a preview link</b>. A redirect that "
    "looks broken on a preview URL is almost certainly fine. Test it on the real "
    "address after the rebuild, in a private window — a cached 301 from an earlier "
    "attempt will lie to you.",
    "warn",
)

g.h2("Changing or removing one")
g.p(
    "Click any redirect to edit it, then Publish. To remove one, open it and delete "
    "the document. Either way it takes effect on the next rebuild."
)
g.p(
    "<b>Don't delete a redirect because traffic to it dried up.</b> Links on other "
    "people's websites keep sending people for years, and those links are the "
    "reason the redirect earns its keep."
)

with g.keep():
    g.h2("What you can't do here")
    g.p("These need a developer and a code change:")
    g.bullets([
        "<b>A whole folder in one rule</b> — a wildcard, sending everything under "
        "<b>/old-section/</b> somewhere new. A couple of these already exist in "
        "code and can't be seen or edited in the Studio.",
        "<b>Redirecting the homepage.</b>",
        "<b>Anything that depends on the visitor</b> — country, device, language.",
    ])

# ── 15. Sitemap and robots ────────────────────────────────────────────────────
g.section("15", "The sitemap and robots.txt", "What's listed, what isn't, and why")

g.p(
    "Both files are generated from the Studio every time the site rebuilds. Neither "
    "is edited by hand, and neither can drift out of date."
)
g.code(f"https://{DOMAIN}/sitemap.xml")

g.h2("What's in it")
g.p("Every page on the site that has a URL of its own:")
g.bullets([
    "The fixed pages — home, our firm, our team, practice areas, trial experience, "
    "testimonials, videos, news, podcast, contact, privacy and disclaimer",
    "Every practice area, including nested sub-topics",
    "Every location page, under its city",
    "Every team member bio",
    "Every podcast episode",
    "Any news article set to <b>\"Full article on our site\"</b>",
    "The site map page",
])

g.h2("What's excluded, and why")
g.bullets([
    "<b>Anything with \"Hide from search engines\" on.</b> That switch is the only "
    "thing that removes a page from the sitemap — there is no separate sitemap "
    "control, and that is deliberate: a page you don't want indexed shouldn't be "
    "advertised either.",
    "<b>External news items.</b> They link to somebody else's site and have no page "
    "of their own here.",
    "<b>The Studio, the 404, and the site's own machinery</b> — <b>/admin</b>, "
    "<b>robots.txt</b>, <b>sitemap.xml</b> and the form endpoint are permanently "
    "excluded and can't be redirected either.",
])

g.h2("Two things about the sitemap worth knowing")
g.callout(
    "<b>lastmod</b> is the record's last edit, not the content's.",
    "Fix a typo, change a phone number, or write a meta description, and that "
    "page's <b>lastmod</b> moves to today. It is honest about when the record "
    "changed; it does not claim the content was rewritten. Don't read a wave of "
    "fresh dates after a metadata pass as anything more than that.",
    "note",
)
g.p(
    "There is no <b>priority</b> or <b>changefreq</b> on any entry, on purpose — "
    "Google has ignored both for years, and a hand-maintained priority column is "
    "just something else to go stale."
)

g.h2("robots.txt")
g.p("In normal operation the file reads:")
g.code("User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://" + DOMAIN
       + "/sitemap.xml")
g.p(
    "The only thing blocked is the Studio itself — an editing tool, not content. "
    "The sitemap is advertised here as well as submitted in Search Console, which "
    "is how Bing and everyone else finds it."
)

g.h2("The switch that changes all of that")
g.p(
    "<b>Site Settings &rarr; Global SEO Settings &rarr; Defaults</b> holds a switch "
    "called <b>\"Discourage this site from being crawled\"</b>."
)
g.callout(
    "On a live site this switch must be OFF.",
    "Turning it on takes the entire site out of Google: every page gets <b>noindex, "
    "nofollow</b>, and robots.txt changes to <b>Disallow: /</b> across the board. It "
    "exists for the period before launch, when a site sits on a temporary address "
    "and shouldn't be indexed there. If you ever find it switched on, that is an "
    "emergency, not a setting — turn it off and publish.",
    "warn",
)

# ── 16. Search Console ────────────────────────────────────────────────────────
g.section("16", "Search Console and Bing",
          "Verifying, submitting, and what to watch")

g.h2("Verifying ownership")
g.p(
    "There is no field in the Studio for a verification meta tag — it was left out "
    "deliberately, because a pasted script or tag in a content field is a way to "
    "break every page at once. Use one of these instead:"
)
g.table(
    ["METHOD", "HOW", "USE IT?"],
    [
        ["DNS record",
         "Add the TXT record Google gives you at the registrar or DNS host. Verifies "
         "the whole domain including subdomains, and survives every redeploy.",
         "<b>Yes — this is the one to use.</b>"],
        ["Google Analytics or Tag Manager",
         "Verifies through an existing snippet.",
         "Only if one has been installed — see section 21."],
        ["HTML file upload",
         "Drop a file at the site root.",
         "Possible, but a developer has to add it to the repo."],
        ["HTML meta tag",
         "A tag in the page head.",
         "Needs a developer. Prefer DNS."],
    ],
    [0.20, 0.50, 0.30],
)
g.p(
    "Verify the <b>domain property</b> rather than the URL prefix if you can — it "
    "covers both the www and non-www forms in one property, which matters here "
    "because the bare domain redirects to www."
)

g.h2("Submitting the sitemap")
g.p("In Search Console, under <b>Sitemaps</b>, submit:")
g.code(f"https://{DOMAIN}/sitemap.xml")
g.p(
    "Bing Webmaster Tools can import the whole Search Console property, which is "
    "faster than setting it up twice. The sitemap address is also advertised in "
    "robots.txt, so crawlers that never see either dashboard still find it."
)

with g.keep():
    g.h2("What to watch")
    g.p(
        "This site was migrated from a previous host, and the redirect table exists "
        "to carry that history across. The things worth checking:"
    )
    g.bullets([
        "<b>Coverage: 404s.</b> Every 404 with inbound traffic is a redirect "
        "nobody has written yet. That's the main way the redirect list should "
        "grow — drive it from real data, not guesswork.",
        "<b>Coverage: \"Page with redirect\".</b> Expected for the old inherited "
        "URLs. Worth a look if a URL you care about appears here unexpectedly.",
        "<b>The canonical address.</b> Every page canonicalises to the <b>www</b> "
        "form with no trailing slash. If Search Console reports a different "
        "canonical from the one declared, that's worth raising.",
        "<b>Performance: queries with impressions but no clicks.</b> Cross-reference "
        "against the crawl from section 13 — a page with impressions and a fallback "
        "title is the highest-value thing you can rewrite.",
    ])

# ── 17. Structured data ───────────────────────────────────────────────────────
g.section("17", "Structured data",
          "The markup this site emits, and the one field that breaks it")

g.p(
    "The site emits schema.org markup automatically, built from what's in the "
    "Studio. There is nothing to switch on, and no markup field to fill in. There "
    "are exactly two kinds."
)

g.h2("1. Business markup, on every page")
g.p(
    "A <b>LegalService</b> block appears on every single page, assembled entirely "
    "from <b>Site Settings &rarr; Firm Details</b>:"
)
g.table(
    ["FIRM DETAILS FIELD", "BECOMES"],
    [
        ["Firm Name", "The business name"],
        ["Tagline", "The business description"],
        ["Phone Number", "The listed telephone number"],
        ["Email", "The listed email address"],
        ["Street, and City / State ZIP", "The postal address"],
        ["Social links", "The \"same as\" profile links search engines use to "
                        "connect the firm to its social accounts"],
        ["Logo", "The business logo and image"],
    ],
    [0.34, 0.66],
)
g.callout(
    "The address format is stricter than it looks.",
    "The <b>City, State ZIP</b> field is read by pattern, and it expects exactly "
    "<b>Houston, TX 77002</b> — city, comma, two-letter state, ZIP. Write it any "
    "other way and the city, state and postcode are <b>silently dropped</b> from "
    "the markup, leaving only the street. Nothing warns you, and the page looks "
    "fine. Test the homepage in Google's Rich Results Test after any edit to that "
    "field.",
    "warn",
)

g.h2("2. FAQ markup, where there are FAQs")
g.p(
    "A <b>FAQPage</b> block is emitted on any <b>practice area</b> or <b>location "
    "page</b> that has entries in its FAQs field. This is the one piece of "
    "structured data you control directly, by writing content — and any practice "
    "area or location page with an empty FAQs field is a page not carrying it."
)
g.bullets([
    "Add them on the page itself, in the <b>FAQs</b> field — not in the FAQs "
    "collection.",
    "Both a question and an answer are required; incomplete pairs are dropped.",
    "Answers are flattened to plain text for the markup, so links and bold inside "
    "an answer show on the page but not in the markup. Write answers that stand up "
    "as plain sentences.",
])
g.callout(
    "The FAQs collection is a different thing.",
    "<b>Collections &rarr; FAQs</b> feeds the question-and-answer band on the "
    "homepage. That band emits <b>no</b> structured data — deliberately, so the site "
    "never declares two conflicting FAQ blocks on one page. If you want FAQ markup, "
    "it has to be on a practice area or a location page.",
    "note",
)

with g.keep():
    g.h2("What is not emitted")
    g.p(
        "So nobody spends an afternoon looking for a switch that doesn't exist. "
        "None of these are on the site, and each would be a developer job:"
    )
    g.bullets([
        "<b>Breadcrumb markup</b> — the data exists behind the scenes but nothing "
        "renders it. Probably the smallest of these to add.",
        "<b>Person markup</b> on attorney bios.",
        "<b>Article or NewsArticle</b> markup on news and podcast pages.",
        "<b>Review or AggregateRating</b> markup on testimonials. Note that review "
        "markup for a law firm carries real risk under attorney-advertising rules — "
        "this is a conversation with the firm, not just a build task.",
        "<b>VideoObject</b> markup on the videos page.",
    ])

# ── 18. Pages you can create ──────────────────────────────────────────────────
g.section("18", "Pages you can create", "The content model as a ranking lever")

g.p(
    "Metadata only optimises pages that exist. The bigger lever is that you can "
    "create pages — real ones, with their own URLs, without a developer. Section 5 "
    "covers the mechanics of adding a record; this is about which ones earn a URL "
    "and how that URL is built."
)

g.h2("Practice areas")
g.p("The main body of the site, and the pages people search for by name.")
g.table(
    ["FIELD", "WHAT IT DOES FOR YOU"],
    [
        ["Title", "The page heading, and the title-tag fallback."],
        ["Slug", "<b>One</b> path segment, not a full path."],
        ["Parent", "Leave empty for a top-level area, or point it at another area "
                  "to nest this one beneath it. The URL is built from the whole "
                  "chain, so nesting a page changes its address."],
        ["Card summary", "The grid-card sentence — and the meta-description "
                         "fallback. Worth writing even when you also write a meta "
                         "description."],
        ["Body", "The page itself, with the insertable blocks from section 9."],
        ["FAQs", "Produces FAQ rich results. See section 17."],
        ["Reviewed by", "Names the attorney who reviewed the page, shown on it. "
                        "Falls back to the default reviewer in Firm Details."],
    ],
    [0.20, 0.80],
)
g.p("A top-level area lands at:")
g.code("/practice-areas/health-care-fraud-defense")
g.p("A child of that area lands at:")
g.code("/practice-areas/health-care-fraud-defense/kickback-allegations")

g.h2("City pages")
g.p("Two records working together, and the main lever for local search.")
g.bullets([
    "<b>Service Cities</b> — just a city name and its URL segment. It has no page "
    "of its own; it's the folder.",
    "<b>Location Pages</b> — the actual pages. Each points at a city and carries "
    "its own title, nav label, slug, lede, body and FAQs.",
])
g.p("Together they produce:")
g.code("/fort-worth/federal-criminal-defense")
g.p(
    "Adding a city page for a practice you already cover, in a city you already "
    "serve, is the cheapest new page on this site — and the <b>Lede</b> field is "
    "its meta-description fallback, so write that even if you write nothing else."
)

g.h2("News")
g.p("One field decides whether a record becomes a page at all — <b>This item</b>:")
g.table(
    ["SETTING", "WHAT HAPPENS"],
    [
        ["Links to external coverage",
         "A card on the news page linking out to the publication. <b>No page here, "
         "no sitemap entry, and its SEO tab does nothing.</b>"],
        ["Full article on our site",
         "A real page at <b>/news/&lt;slug&gt;</b>, in the sitemap, with a working "
         "SEO tab."],
    ],
    [0.30, 0.70],
)
g.p(
    "That second option is the closest thing this site has to a blog. If original "
    "content is part of the plan, this is where it goes — no new page type needed."
)

g.h2("The rest")
g.table(
    ["TYPE", "URL", "NOTE"],
    [
        ["Team Member Bios", "/our-team/&lt;slug&gt;",
         "Attorneys and staff. The description fallback here is generated, so these "
         "benefit most from a written one."],
        ["Podcast Episodes", "/podcast/&lt;slug&gt;",
         "Each episode is a real page with its own SEO tab."],
        ["Videos, Testimonials, Trial Results, FAQs", "None",
         "These appear inside other pages. Adding more strengthens the page that "
         "renders them; none gets a URL of its own."],
    ],
    [0.28, 0.24, 0.48],
)

g.h2("The slug rule")
g.callout(
    "Changing a slug changes the URL, and every link to it breaks.",
    "Nothing stops you, and nothing warns you. The old address starts returning a "
    "404 on the next rebuild, taking whatever it had earned with it. <b>Add a "
    "redirect from the old path to the new one in the same sitting</b> — before you "
    "publish the change, so the two go live together. This is the single easiest "
    "way to lose rankings on this site.",
    "warn",
)

# ── 19. Site-wide settings ────────────────────────────────────────────────────
g.section("19", "Site-wide settings",
          "Two documents that affect every page at once")

g.h2("Global SEO Settings &rarr; Defaults")
g.table(
    ["FIELD", "WHAT IT DOES", "WHAT IT SHOULD BE"],
    [
        ["Discourage this site from being crawled",
         "Takes the whole site out of search — noindex on every page plus a blanket "
         "block in robots.txt. Pre-launch only. See section 15.",
         "<b>Off</b>, always, on a live site."],
        ["Default social share image",
         "The 1200 x 630 image used whenever a page has no share image of its own.",
         "Set — otherwise a page with no image of its own is shared as a bare "
         "link."],
    ],
    [0.26, 0.48, 0.26],
)

g.h2("Firm Details")
g.p(
    "Not labelled SEO, but it is: this is the firm's name, address and phone as "
    "search engines read them (section 17). It is the site's half of the "
    "name-address-phone consistency that local search runs on."
)
g.bullets([
    "Keep it <b>byte-identical</b> to the Google Business Profile and the major "
    "directories. \"Suite 2400\" and \"Ste. 2400\" are not the same string.",
    "<b>City, State ZIP</b> must read <b>Houston, TX 77002</b>. Any other shape and "
    "the locality silently vanishes from the markup.",
    "The social links become the \"same as\" profile links. Add every profile the "
    "firm actually maintains, and remove any it doesn't — a dead link here connects "
    "the firm to an abandoned account.",
    "The phone number here is the one search engines see. Changing it rewrites the "
    "markup on every page at once.",
])
g.callout(
    "Firm Details is not only structured data.",
    "The same fields render in the footer and the contact bar across the site, so "
    "an edit here is visible to humans as well as crawlers. Check the live site "
    "after changing it, not just the Rich Results Test.",
    "note",
)

# ═══════════════════════════════════════════════════════════════════════════════
# REFERENCE
# ═══════════════════════════════════════════════════════════════════════════════
g.part("Reference", "Care, limits and quick answers",
       "The things worth reading before you need them")

# ── 20. Please be careful ─────────────────────────────────────────────────────
g.section("20", "Please be careful with these",
          "The things that are hard to undo")

g.p(
    "Nothing in this list is fragile, and none of it is a reason to be timid. These "
    "are simply the handful of actions whose consequences outlive the click."
)

g.h3("1. The crawl switch")
g.p(
    "<b>Site Settings &rarr; Global SEO Settings &rarr; Defaults &rarr; Discourage "
    "this site from being crawled.</b> One click takes the entire site out of "
    "Google. On a live site there is no legitimate reason to touch it. Turning it "
    "back off is instant; getting re-indexed afterwards is not."
)

g.h3("2. Changing a slug without a redirect")
g.p(
    "The old address starts returning a 404 on the next rebuild, and everything it "
    "had earned goes with it. Write the redirect first and publish both together — "
    "section 14. This is the single easiest way to lose rankings on this site, and "
    "the fix takes a minute."
)

g.h3("3. The Parent field on a practice area")
g.p(
    "It builds the page's address. Moving an area under a different parent changes "
    "its URL exactly as if you had edited the slug — same consequence, same fix. "
    "It's easier to miss because it doesn't look like a URL field."
)

g.h3("4. Canonical URL")
g.p(
    "Leave it blank unless you are certain. It tells search engines that another "
    "page is the one to rank instead of this one, and it changes the page's social "
    "share URL at the same time. It is the quietest way to take a page out of "
    "search results — nothing looks wrong, the page just stops appearing."
)

g.h3("5. Deleting instead of unpublishing")
g.p(
    "Unpublish takes a record off the site and keeps it. Delete destroys it. When "
    "in doubt, unpublish — you can always delete later, and never the reverse."
)

g.h3("6. Deleting a redirect")
g.p(
    "Redirects carry links from other people's websites, and those links keep "
    "sending people for years after the traffic report goes quiet. Low traffic is "
    "not evidence that a redirect has finished its job."
)

g.h3("7. Hide from search engines")
g.p(
    "A per-page switch that also removes the page from the sitemap. Easy to set "
    "during a campaign and forget about, because nothing on the page itself shows "
    "that it's hidden — only the SEO tab does. Worth auditing occasionally."
)

g.h3("8. Everything here is live")
g.p(
    "There is no staging copy of the content. Drafts protect you right up until you "
    "publish, and publishing is immediate and public. Treat Publish the way you'd "
    "treat pushing a change to a production website, because that is exactly what "
    "it is."
)

# ── 21. What needs a developer ────────────────────────────────────────────────
g.section("21", "What needs a developer",
          "So you don't waste an afternoon looking")

g.table(
    ["YOU WANT", "WHY IT'S NOT IN THE STUDIO"],
    [
        ["A brand-new kind of page",
         "Page designs are built in code. Practice areas, location pages and owned "
         "news articles cover most requests — check those first."],
        ["A different colour, font or layout", "All design lives in code."],
        ["A wildcard redirect",
         "One rule covering everything under a folder. The redirect system here "
         "matches exact paths. A couple of wildcards already exist in code."],
        ["To redirect the homepage", "Blocked in the Studio on purpose."],
        ["Analytics, a pixel, or call tracking",
         "The intended route is a single Tag Manager container added once, after "
         "which every future tag is a Tag Manager change with no rebuild. Worth "
         "asking for early — it's a small job that unblocks a lot."],
        ["A verification meta tag",
         "No field exists for it, deliberately. Use DNS verification instead — "
         "section 16."],
        ["Breadcrumb, Person, Article or Review markup",
         "Not emitted today. Section 17 has the full list of what is and isn't."],
        ["An SEO tab on Videos, FAQs or Testimonials",
         "They have no page of their own to optimise."],
        ["Different og:type or article tags per page type",
         "Every page currently declares itself a website."],
    ],
    [0.30, 0.70],
)

g.callout(
    "When you do raise something, three things answer most of it in one reply.",
    "The <b>page address</b>, <b>what you expected</b>, and <b>what happened "
    "instead</b>. For a redirect that isn't firing, add whether you tested it on "
    "the live address in a private window — that alone resolves about half of "
    "them. Don't unpublish a page to hide a problem; that turns a wrong page into "
    "a missing one.",
    "tip",
)

# ── 22. Common questions ──────────────────────────────────────────────────────
g.section("22", "Common questions", "Quick answers")

g.qa([
    ("I published a change and the live page hasn't updated.",
     "Give it two or three minutes — publishing rebuilds the whole site. If it's still "
     "stale after five, hard-refresh the page: Cmd+Shift+R on a Mac, Ctrl+F5 on Windows."),
    ("The Publish button is greyed out.",
     "Either nothing has changed since the last publish, or a required field is empty. "
     "Scroll the form for a red message."),
    ("Where do I change the phone number?",
     "Site Settings &rarr; Firm Details, once. It drives the header, the footer, the "
     "contact page, every call-to-action band and the markup search engines read."),
    ("I added someone and can't find them on the site.",
     "New records go to the bottom of their list, and the list order is the site order. "
     "Open Collections &rarr; Team Member Bios and drag them into place. Check you "
     "published, too."),
    ("Can I add a brand-new page?",
     "Not a new <i>kind</i> of page, but you can add as many practice areas, location "
     "pages and owned news articles as you like — and each is a real page with its own "
     "address. Section 18."),
    ("I deleted something by mistake.",
     "Stop and ask before doing anything else. Document history can usually recover it, "
     "and that gets harder the more that happens afterwards."),
    ("My redirect isn't working.",
     "Three usual causes. You tested it on a preview link, where redirects never run. "
     "Your browser cached an earlier response — try a private window. Or the old URL is "
     "a live page, in which case the Studio warned you and the build ignored the rule."),
    ("Do I need to write a meta description for every page?",
     "No. The fallbacks are real sentences on most page types (section 13). Spend the "
     "effort where the fallback is generated rather than written — the bios first, then "
     "any practice area with a thin card summary."),
    ("The title I wrote is showing up with the firm name after it.",
     "That's correct. \" | Cogdell Law\" is appended automatically — don't type it "
     "yourself, and remember it counts towards your 60 characters."),
    ("Can I add a page to the sitemap manually?",
     "There is no manual sitemap. Every page with a URL is in it automatically, unless "
     "\"Hide from search engines\" is on. If a page is missing, that switch is the first "
     "thing to check; an external news item is the other common case, and it has no page "
     "at all."),
    ("Where's the video file?",
     "There isn't one. Wistia holds the video; the Studio holds only its ID, and the "
     "thumbnail and running time are fetched from Wistia when the site builds."),
    ("Is there a preview of what Google will show?",
     "Not in the Studio. Publish, wait for the rebuild, then put the live URL into "
     "Google's Rich Results Test or any SERP preview tool. The character counters in the "
     "SEO tab are the guardrail while you type."),
    ("Something changed and nobody knows who did it.",
     "Every record keeps its history, including who published each version and what "
     "changed. Open the record and look at its history — which is why shared logins are "
     "worth avoiding."),
])

g.space(20)
g.callout(
    "The one thing to take away.",
    "Publish rebuilds everything — every page, the sitemap, robots.txt and the "
    "redirect table, together. That's why you can move a URL without a developer, "
    "and why nothing you change is ever instant. Almost everything else in this "
    "guide is a detail hanging off that.",
    "tip",
)

g.build()
