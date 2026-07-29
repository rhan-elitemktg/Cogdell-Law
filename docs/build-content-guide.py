#!/usr/bin/env python3
"""Builds docs/Cogdell-Law-Content-Guide.pdf — the guide for content editors.

The PDF is the deliverable; this is how it gets rebuilt when the Studio changes.

    python3 -m venv /tmp/guide-venv
    /tmp/guide-venv/bin/pip install reportlab
    /tmp/guide-venv/bin/python docs/build-content-guide.py

Everything is laid out with reportlab's built-in Helvetica, which covers Latin-1
plus a handful of symbols. It does NOT cover the fullwidth forms — a literal
Sanity "+ Create" typed with U+FF0B renders as a solid black box. Stick to ASCII
punctuation; em dashes, the middle dot and the arrow are fine.

Two layout rules worth keeping:
  - The frame is built with zero padding so paragraphs line up with the tables
    and callouts, which are all CONTENT_W wide.
  - Vertical space around tables is set with .spaceBefore/.spaceAfter, never a
    Spacer flowable. A trailing Spacer flows onto the next page and strands a
    blank one behind the following section break.
"""

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
# A plain PageBreak after content that happened to fill a page exactly emits a
# blank page. This one is a no-op when the frame is already empty.
from reportlab.platypus.flowables import PageBreakIfNotEmpty

# ── Palette (the Studio's own Elite theme) ────────────────────────────────────
NAVY = colors.HexColor("#0C143A")
NAVY_SOFT = colors.HexColor("#3A4467")
TEAL = colors.HexColor("#0199A6")
TEAL_PALE = colors.HexColor("#E6F5F7")
GOLD = colors.HexColor("#A07A3C")
GOLD_PALE = colors.HexColor("#FBF4E6")
INK = colors.HexColor("#20242E")
BODY = colors.HexColor("#3C4350")
MUTED = colors.HexColor("#767E8C")
RULE = colors.HexColor("#DDDFE4")
PAPER = colors.HexColor("#F6F5F2")
ROSE_PALE = colors.HexColor("#FDEEE9")
ROSE = colors.HexColor("#C0451C")

PAGE_W, PAGE_H = LETTER
MARGIN_X = 0.95 * inch
MARGIN_TOP = 0.95 * inch
MARGIN_BOT = 0.85 * inch
CONTENT_W = PAGE_W - 2 * MARGIN_X

OUT = "/Users/rhanpemberton/my_apps/Cogdell-Law/docs/Cogdell-Law-Content-Guide.pdf"

# ── Styles ────────────────────────────────────────────────────────────────────
S = {}
S["h1"] = ParagraphStyle(
    "h1", fontName="Helvetica-Bold", fontSize=21, leading=25,
    textColor=NAVY, spaceBefore=0, spaceAfter=4,
)
S["h1sub"] = ParagraphStyle(
    "h1sub", fontName="Helvetica", fontSize=10.5, leading=15,
    textColor=MUTED, spaceBefore=0, spaceAfter=16,
)
S["h2"] = ParagraphStyle(
    "h2", fontName="Helvetica-Bold", fontSize=13.5, leading=17,
    textColor=NAVY, spaceBefore=17, spaceAfter=6,
)
S["h3"] = ParagraphStyle(
    "h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14,
    textColor=TEAL, spaceBefore=13, spaceAfter=4,
)
S["body"] = ParagraphStyle(
    "body", fontName="Helvetica", fontSize=10, leading=15.4,
    textColor=BODY, spaceAfter=8, alignment=TA_LEFT,
)
S["bullet"] = ParagraphStyle(
    "bullet", parent=S["body"], leftIndent=15, bulletIndent=3, spaceAfter=5,
)
S["step"] = ParagraphStyle(
    "step", parent=S["body"], leftIndent=25, spaceAfter=7,
)
S["callout"] = ParagraphStyle(
    "callout", fontName="Helvetica", fontSize=9.5, leading=14.5,
    textColor=INK, spaceAfter=0,
)
S["calloutHead"] = ParagraphStyle(
    "calloutHead", fontName="Helvetica-Bold", fontSize=9.5, leading=14,
    textColor=NAVY, spaceAfter=3,
)
S["cell"] = ParagraphStyle(
    "cell", fontName="Helvetica", fontSize=9, leading=13, textColor=BODY,
)
S["cellb"] = ParagraphStyle(
    "cellb", fontName="Helvetica-Bold", fontSize=9, leading=13, textColor=NAVY,
)
S["cellhead"] = ParagraphStyle(
    "cellhead", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
    textColor=colors.white,
)
S["toc"] = ParagraphStyle(
    "toc", fontName="Helvetica", fontSize=10.5, leading=14, textColor=BODY,
)
S["tocnum"] = ParagraphStyle(
    "tocnum", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=TEAL,
)


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def P(t, style="body"):
    return Paragraph(t, S[style])


def bullets(items, style="bullet"):
    return [Paragraph(t, S[style], bulletText="•") for t in items]


def steps(items):
    out = []
    for i, t in enumerate(items, 1):
        out.append(Paragraph(t, S["step"], bulletText=f"{i}."))
    return out


def callout(title, text, kind="tip"):
    """A tinted box. kind: tip | warn | note"""
    bg, bar = {
        "tip": (TEAL_PALE, TEAL),
        "warn": (ROSE_PALE, ROSE),
        "note": (GOLD_PALE, GOLD),
    }[kind]
    inner = []
    if title:
        inner.append(Paragraph(title, S["calloutHead"]))
    inner.append(Paragraph(text, S["callout"]))
    t = Table([[inner]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
        ("LINEBEFORE", (0, 0), (0, -1), 3, bar),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    # spaceBefore/spaceAfter rather than Spacer flowables: trailing space set this
    # way is discarded at a page boundary, where a Spacer would flow onto the next
    # page and leave a stranded blank one behind a section break.
    t.spaceBefore, t.spaceAfter = 4, 12
    return [t]


def datatable(header, rows, widths):
    data = [[Paragraph(h, S["cellhead"]) for h in header]]
    for r in rows:
        data.append([Paragraph(r[0], S["cellb"])] + [Paragraph(c, S["cell"]) for c in r[1:]])
    t = Table(data, colWidths=widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 1), (-1, -2), 0.5, RULE),
        ("BOX", (0, 1), (-1, -1), 0.5, RULE),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), PAPER))
    t.setStyle(TableStyle(style))
    t.spaceBefore, t.spaceAfter = 3, 12
    return [t]


# ── Page furniture ────────────────────────────────────────────────────────────
def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 4.55 * inch, PAGE_W, 4.55 * inch, stroke=0, fill=1)
    canvas.setFillColor(TEAL)
    canvas.rect(0, PAGE_H - 4.62 * inch, PAGE_W, 0.07 * inch, stroke=0, fill=1)

    canvas.setFillColor(TEAL)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(MARGIN_X, PAGE_H - 1.5 * inch, "C O G D E L L   L A W   F I R M")

    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 33)
    canvas.drawString(MARGIN_X, PAGE_H - 2.42 * inch, "Content Editor's")
    canvas.drawString(MARGIN_X, PAGE_H - 2.95 * inch, "Guide")

    canvas.setFillColor(colors.HexColor("#AEB6CC"))
    canvas.setFont("Helvetica", 12.5)
    canvas.drawString(MARGIN_X, PAGE_H - 3.62 * inch,
                      "How to update the website — no coding required")

    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 9.5)
    canvas.drawString(MARGIN_X, 1.28 * inch, "Prepared by Elite Legal Marketing")
    canvas.setFillColor(colors.HexColor("#9AA1AE"))
    canvas.drawString(MARGIN_X, 1.06 * inch, "July 2026  ·  Version 1.0")
    canvas.restoreState()


def body_page(canvas, doc):
    canvas.saveState()
    # header rule
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN_X, PAGE_H - 0.66 * inch, PAGE_W - MARGIN_X, PAGE_H - 0.66 * inch)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN_X, PAGE_H - 0.58 * inch, "COGDELL LAW FIRM  ·  CONTENT EDITOR'S GUIDE")

    # footer
    canvas.line(MARGIN_X, 0.72 * inch, PAGE_W - MARGIN_X, 0.72 * inch)
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN_X, 0.52 * inch, str(canvas.getPageNumber() - 1))
    canvas.restoreState()


# ── Content ───────────────────────────────────────────────────────────────────
story = []


def section(number, title, subtitle=None, newpage=True):
    if newpage:
        story.append(PageBreakIfNotEmpty())
    story.append(Paragraph(f'<font color="#0199A6">{number}.</font>  {title}', S["h1"]))
    if subtitle:
        story.append(Paragraph(subtitle, S["h1sub"]))
    else:
        story.append(Spacer(1, 10))


# ── Cover → TOC ───────────────────────────────────────────────────────────────
story.append(NextPageTemplate("body"))
story.append(PageBreak())

story.append(Paragraph("What's in this guide", S["h1"]))
story.append(Spacer(1, 14))

toc = [
    ("1", "Start here", "What the Studio is, and the one rule that matters"),
    ("2", "Signing in", "Getting into the Studio for the first time"),
    ("3", "How the Studio is organised", "Pages, Collections, Site Settings"),
    ("4", "Editing something", "Open, change, publish — the everyday loop"),
    ("5", "Adding something new", "Creating a record, and filling in a slug"),
    ("6", "Removing something", "Unpublish versus delete"),
    ("7", "Writing text", "Headings, links, lists and quotes"),
    ("8", "Adding images", "Uploading, cropping and describing"),
    ("9", "The special blocks", "Banners and cards inside practice-area pages"),
    ("10", "Putting things in order", "The lists you can drag to reorder"),
    ("11", "The SEO tab", "What to fill in, and what to leave alone"),
    ("12", "Where everything lives", "A page-by-page reference"),
    ("13", "Please be careful with these", "The handful of things that can hurt"),
    ("14", "Common questions", "Quick answers"),
]
rows = []
for num, title, blurb in toc:
    rows.append([
        Paragraph(num, S["tocnum"]),
        Paragraph(f'<b>{title}</b><br/><font color="#767E8C" size="9">{blurb}</font>', S["toc"]),
    ])
t = Table(rows, colWidths=[0.4 * inch, CONTENT_W - 0.4 * inch])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("LEFTPADDING", (0, 0), (0, -1), 0),
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
]))
story.append(t)

# ── 1. Start here ─────────────────────────────────────────────────────────────
section("1", "Start here", "What the Studio is, and the one rule that matters")

story += callout(
    "This guide is for people who write and update content.",
    "You do not need to know how to code, and nothing in here will ask you to. "
    "If you can use a word processor, you can use the Studio.",
    "tip",
)
story.append(P(
    "Everything you read on the Cogdell Law website — every headline, paragraph, "
    "photo, attorney bio, testimonial and phone number — is stored in a system "
    "called <b>Sanity Studio</b>. The website itself has no words of its own. It "
    "asks the Studio what to say, and prints it."
))
story.append(P(
    "That means you can change anything on the site without a developer. It also "
    "means a change you make in the Studio is a change to the live website."
))

story.append(Paragraph("The one rule", S["h2"]))
story.append(P(
    "Your work is private until you press <b>Publish</b>. Type as much as you "
    "like, save drafts, come back tomorrow — nobody sees any of it. The moment "
    "you publish, the website rebuilds itself and your change goes live to the "
    "public a couple of minutes later."
))
story += callout(
    "Nothing you do is instant, and nothing is lost.",
    "Publishing triggers an automatic rebuild of the site. Give it two or three "
    "minutes before you check the live page. If you refresh straight away and "
    "the change isn't there, it isn't broken — it just hasn't finished yet.",
    "note",
)

story.append(Paragraph("What you can and can't do", S["h2"]))
story.append(P("You can:"))
story += bullets([
    "Change any words or images on any page",
    "Add attorneys, practice areas, testimonials, news, podcast episodes, videos and FAQs",
    "Remove or hide things you no longer want",
    "Reorder the lists that appear on the site",
    "Set the title and description that show up in Google",
])
story.append(Spacer(1, 4))
story.append(P("You can't (and shouldn't need to):"))
story += bullets([
    "Create a brand-new type of page — the page designs are built in code",
    "Change colours, fonts or layout",
    "Delete one of the main pages — they're locked so nobody can remove them by accident",
])

# ── 2. Signing in ─────────────────────────────────────────────────────────────
section("2", "Signing in", "Getting into the Studio for the first time")

story.append(P(
    "The Studio lives at the website's own address with <b>/admin</b> on the end. "
    "If the site is at <b>cogdell-law.com</b>, the Studio is at:"
))
story += callout(
    None,
    '<font face="Helvetica-Bold" size="12" color="#0C143A">cogdell-law.com/admin</font>',
    "tip",
)
story.append(P("Then:"))
story += steps([
    "Bookmark that address. You'll use it every time.",
    "Choose the sign-in method you were invited with — usually Google, or an "
    "email and password.",
    "The first time, you may be asked to allow the Studio access to your "
    "account. That's normal; approve it.",
])

story.append(Paragraph("If it won't let you in", S["h2"]))
story.append(P(
    "The Studio only opens for people who have been <b>invited to the project</b>. "
    "Signing in with an account nobody has invited will get you a polite refusal, "
    "not an error — it isn't a broken password. Ask whoever manages the site to "
    "send you an invitation, and make sure you sign in with the same email address "
    "the invitation went to."
))
story += callout(
    "Use one account, and keep it to yourself.",
    "The Studio records who changed what. Sharing a login makes that history "
    "useless, and it's the first thing anyone looks at when a page changes "
    "unexpectedly. If someone new needs access, have them invited properly.",
    "warn",
)

# ── 3. Organisation ───────────────────────────────────────────────────────────
section("3", "How the Studio is organised",
        "Three groups in the left-hand menu — that's the whole map")

story.append(P(
    "When you sign in you'll see a column on the left with three entries. "
    "Everything in the Studio sits inside one of them."
))

story += datatable(
    ["GROUP", "WHAT'S IN IT", "HOW MANY"],
    [
        ["Pages",
         "One entry per page of the website. \"Home Page\", \"Contact Page\", "
         "\"Our Firm Page\", and so on — plus a <b>Legal</b> folder holding the "
         "Privacy Policy and Disclaimer.",
         "Exactly one of each. You can't add or delete them."],
        ["Collections",
         "The things there are lots of: attorney bios, practice areas, "
         "testimonials, news articles, podcast episodes, videos, FAQs, trial "
         "results, service cities and location pages.",
         "As many as you like. Add and remove freely."],
        ["Site Settings",
         "Things that appear on <i>every</i> page: the firm's phone number and "
         "address, the call-to-action bar, the consultation form wording, the "
         "fact-checked banner, and site-wide search settings.",
         "Exactly one of each."],
    ],
    [1.15 * inch, CONTENT_W - 3.0 * inch, 1.85 * inch],
)

story.append(Paragraph("The difference that matters", S["h2"]))
story.append(P(
    "<b>Pages</b> hold the wording of one specific page. <b>Collections</b> hold "
    "records that get <i>used</i> by pages. A testimonial isn't a page — it's a "
    "record that shows up on the homepage, on the testimonials page, and possibly "
    "inside a practice-area page. Write it once, and it appears everywhere it's needed."
))
story += callout(
    "Why some things are locked",
    "You'll notice you can't create a second Home Page, and the global "
    "\"+ Create\" button doesn't offer one. That's deliberate — a duplicate would "
    "be invisible to the website and would quietly waste your time. The pages that "
    "exist are the pages the site has.",
    "note",
)
story += callout(
    "Change the phone number in one place.",
    "The number in <b>Site Settings → Firm Details</b> is the one used in the "
    "header, the footer, the contact page and every call-to-action on the site. "
    "Change it once and it changes everywhere. This is what Site Settings is for.",
    "tip",
)

# ── 4. Editing ────────────────────────────────────────────────────────────────
section("4", "Editing something", "The loop you'll use ninety per cent of the time")

story += steps([
    "Click through the left-hand menu until you find what you want — for example "
    "<b>Pages → Contact Page</b>, or <b>Collections → Attorney Bios → Dan L. Cogdell</b>.",
    "Change what you want to change. There's no Save button; your typing is kept "
    "as you go.",
    "Press <b>Publish</b> at the bottom of the editor.",
    "Wait two or three minutes, then check the live site.",
])

story.append(Paragraph("Reading the editor", S["h2"]))
story += datatable(
    ["WHAT YOU SEE", "WHAT IT MEANS"],
    [
        ["Tabs across the top",
         "Longer records are split into tabs — usually <b>Content</b> and <b>SEO</b>, "
         "sometimes <b>Card</b> and <b>Page</b>. They're all part of the same record. "
         "Publishing publishes all of them at once."],
        ["Grey text under a field",
         "A note from whoever built the site, explaining what that field is for and "
         "where it shows up. Worth reading — they were written for you."],
        ["A red message",
         "Something required is missing or wrong. <b>You cannot publish until it's "
         "fixed.</b> The message says what's needed."],
        ["An orange or yellow message",
         "A suggestion, not a rule — usually \"this reads better if you keep it "
         "shorter\". You can publish anyway. Consider taking the advice."],
        ["The Publish button greyed out",
         "Either there's nothing new to publish, or something required is missing. "
         "Scroll up and look for red."],
    ],
    [1.9 * inch, CONTENT_W - 1.9 * inch],
)

story.append(Paragraph("Changing your mind", S["h2"]))
story.append(P(
    "Before you publish, unwanted edits can be thrown away — look for the option "
    "to discard your draft or revert your changes in the menu beside the Publish "
    "button. After you publish, the Studio keeps a history of the document, so a "
    "previous version can be brought back. If you're not sure how, ask before you "
    "start clicking — it's much easier to recover a mistake than to undo a "
    "well-meant repair."
))
story += callout(
    "Publish when you're finished, not as you go.",
    "Every publish rebuilds the whole website. Publishing ten times while you "
    "work through a page isn't harmful, but it's noisy and slow. Get the page how "
    "you want it, then publish once.",
    "tip",
)

# ── 5. Adding ─────────────────────────────────────────────────────────────────
section("5", "Adding something new", "Only Collections can grow — and that's most of what you'll add")

story += steps([
    "Open the collection you want to add to — say <b>Collections → Testimonials</b>.",
    "Click the <b>+</b> (or \"Create new\") button at the top of the list.",
    "Fill in the fields. Anything the site can't do without will tell you so in red.",
    "Press <b>Publish</b>.",
])

story.append(Paragraph("About slugs", S["h2"]))
story.append(P(
    "Some records ask for a <b>slug</b>. That's the part of the web address that "
    "identifies the page — in <b>cogdell-law.com/attorney/<b><font color=\"#0199A6\">osso-anthony</font></b></b>, "
    "the slug is the highlighted bit."
))
story.append(P(
    "There's a <b>Generate</b> button beside the field that builds one from the "
    "title. Use it. Lower-case letters and hyphens only — no spaces, no "
    "apostrophes, no capitals."
))
story += callout(
    "Never change a slug on a page that's already live.",
    "The slug <i>is</i> the address. Change it and the old address stops working: "
    "anyone who bookmarked that page, any Google result pointing at it, and any "
    "link to it from another website all break at once. If a page genuinely has to "
    "move, tell a developer first so a redirect can be put in place.",
    "warn",
)

story.append(Paragraph("Things that reference other things", S["h2"]))
story.append(P(
    "Some fields ask you to pick an existing record rather than type something. A "
    "location page picks its <b>Service City</b>; a practice area can pick the "
    "attorney who <b>reviewed</b> it; a sub-topic picks its <b>Parent Page</b>. "
    "Start typing and the Studio offers matches. If what you need isn't in the "
    "list, it doesn't exist yet — go and create it first, then come back."
))

# ── 6. Removing ───────────────────────────────────────────────────────────────
section("6", "Removing something", "Unpublish hides it. Delete destroys it.")

story += datatable(
    ["OPTION", "WHAT HAPPENS", "WHEN TO USE IT"],
    [
        ["Unpublish",
         "The record disappears from the website but stays in the Studio. You can "
         "publish it again later and it comes back exactly as it was.",
         "Almost always. An attorney who has left, a seasonal notice, anything you "
         "<i>might</i> want back."],
        ["Delete",
         "The record is gone from the Studio as well. There's no button that "
         "brings it back.",
         "Genuine mistakes — a duplicate, a test entry, something created in the "
         "wrong place."],
    ],
    [1.25 * inch, (CONTENT_W - 1.25 * inch) * 0.55, (CONTENT_W - 1.25 * inch) * 0.45],
)

story.append(P(
    "Both live in the menu beside the Publish button, at the bottom of the editor."
))

story += callout(
    "If something else is pointing at it, the Studio will stop you.",
    "Try to delete an attorney who is set as the reviewer on three practice-area "
    "pages and you'll get a warning listing them. That's the Studio protecting the "
    "site, not malfunctioning. Go and clear those references first — or just "
    "unpublish instead, which is usually what you actually wanted.",
    "warn",
)

story.append(Paragraph("A gentler option: featuring", S["h2"]))
story.append(P(
    "Testimonials have a <b>Feature on the homepage</b> switch. Turning it off "
    "doesn't remove the testimonial — it stays on the full testimonials page and "
    "simply stops appearing on the homepage. Only <b>three</b> can be featured at "
    "once, because the homepage grid is three across. Turn one off before you turn "
    "another on."
))

# ── 7. Writing text ───────────────────────────────────────────────────────────
section("7", "Writing text", "The rich-text editor, and everything its toolbar can do")

story.append(P(
    "Longer fields — an attorney's biography, a practice-area body, an FAQ answer, "
    "the Privacy Policy — use a small formatting toolbar. It is deliberately "
    "limited, so that anything you write comes out looking like the rest of the site."
))

story += datatable(
    ["CONTROL", "WHAT IT'S FOR"],
    [
        ["Normal",
         "Ordinary paragraphs. This is almost everything you write."],
        ["Heading 2 / 3 / 4",
         "Section headings inside the text. <b>Heading 2</b> for main sections, "
         "<b>Heading 3</b> beneath it, <b>Heading 4</b> for the rare third level. "
         "There is no Heading 1 — the big title at the top of the page is already "
         "the Heading 1, and a second one confuses Google."],
        ["Quote",
         "Pulls a passage out as a styled quotation with a decorative quote mark."],
        ["Bold / Italic",
         "As you'd expect. Use bold sparingly — a page where everything is "
         "emphasised reads as though nothing is."],
        ["Link",
         "Select the words first, then add the link. For a page on this site, type "
         "the path only: <b>/contact</b>, not the full address. For another "
         "website, paste the whole address including <b>https://</b>."],
        ["Bulleted / Numbered list",
         "Numbered lists are for genuine sequences — steps in a process. Use "
         "bullets for everything else."],
    ],
    [1.5 * inch, CONTENT_W - 1.5 * inch],
)

story += callout(
    "Don't paste straight from Word.",
    "Word and Google Docs smuggle invisible formatting into anything you copy, and "
    "it can arrive looking wrong in ways that are tedious to clean up. Paste as "
    "plain text (<b>Cmd+Shift+V</b> on a Mac, <b>Ctrl+Shift+V</b> on Windows), then "
    "apply headings and bold in the Studio.",
    "warn",
)

# ── 8. Images ─────────────────────────────────────────────────────────────────
section("8", "Adding images", "Upload once, and let the site do the work")

story.append(P(
    "Drag a file onto an image field, or click it and choose one. The site "
    "automatically produces every size it needs and serves each visitor the "
    "smallest one that will still look sharp — so upload the <b>largest, best "
    "quality version you have</b>. It's far better to give the site a big image "
    "and let it shrink it than to give it a small one it has to stretch."
))

story.append(Paragraph("The hotspot", S["h2"]))
story.append(P(
    "The same photo gets cropped differently in different places — square on a "
    "card, tall beside a quote, wide behind a heading. Click <b>Edit hotspot</b> "
    "(the crop icon) and drag the circle over the part that must never be cut off, "
    "usually a face. Every crop on the site is then built around that point."
))

story.append(Paragraph("Alt text", S["h2"]))
story.append(P(
    "Where a field asks for <b>alt text</b>, describe what the picture shows, in a "
    "plain sentence. \"Dan Cogdell speaking to reporters outside the courthouse\" — "
    "not \"photo\", not \"IMG_4821\", and not a list of keywords."
))
story += callout(
    "Alt text is read aloud to people who can't see the image.",
    "It's also what Google reads. Writing it well takes ten seconds and helps two "
    "audiences at once. Where the image is purely decorative — a background "
    "texture behind a heading — leaving it blank is the correct answer, not a "
    "lazy one.",
    "tip",
)

# ── 9. Special blocks ─────────────────────────────────────────────────────────
section("9", "The special blocks",
        "Practice-area and location pages can hold more than text")

story.append(P(
    "On <b>Practice Areas</b> and <b>Location Pages</b> only, the body field lets "
    "you drop designed sections into the middle of your writing. Look for the "
    "<b>Insert</b> or <b>+</b> control in the editor, and choose one of five:"
))

story += datatable(
    ["BLOCK", "WHAT IT LOOKS LIKE"],
    [
        ["CTA Banner",
         "A dark band with a heading, a supporting line and up to two buttons. For "
         "\"Speak to a defence lawyer today\" moments."],
        ["Get In Touch Bar",
         "A slim bar with a short heading and a phone number, set large. Good "
         "roughly halfway down a long page."],
        ["Attorney Card",
         "Pick an attorney; the site pulls in their photo and details. You add a "
         "short passage and up to two buttons."],
        ["Attorney Quote",
         "Pick an attorney and write a quotation attributed to them. Their portrait "
         "sits alongside it."],
        ["Client Testimonial",
         "Pick an existing testimonial and it appears as a styled card. You don't "
         "retype it — it stays linked to the original."],
    ],
    [1.6 * inch, CONTENT_W - 1.6 * inch],
)

story += callout(
    "These blocks only exist on those two page types.",
    "If you're editing an attorney bio, an FAQ answer, a news article or a legal "
    "page and can't find the Insert menu, that's why — those pages are plain text "
    "by design. It isn't a fault, and it isn't something you're missing.",
    "note",
)
story.append(P(
    "Used sparingly, these blocks break up a long page and give a reader somewhere "
    "to act. Three banners in a row is worse than none: the reader stops seeing them."
))

# ── 10. Ordering ──────────────────────────────────────────────────────────────
section("10", "Putting things in order", "Six lists you can drag — and what the rest do")

story.append(P(
    "In these six collections, the order you set in the Studio is the order the "
    "website uses. Drag a record by its handle to move it."
))
story += bullets([
    "<b>Attorney Bios</b> — the order they appear on the homepage and /attorneys",
    "<b>Practice Areas</b> — the order in the navigation menu and on the cards",
    "<b>Service Cities</b> — the order cities are grouped in",
    "<b>Location Pages</b> — the order within each city",
    "<b>Videos</b> — the order on the videos page",
    "<b>FAQs</b> — the order questions are answered in",
])
story.append(Spacer(1, 6))
story.append(P(
    "The remaining collections — Testimonials, News Articles, Podcast Episodes and "
    "Trial Results — aren't dragged. They're arranged by the page that uses them, "
    "usually newest first, or by a field on the record itself."
))
story += callout(
    "A new record lands at the bottom.",
    "Create a new attorney and they'll appear last on the page until you drag them "
    "where they belong. It's easy to publish and wonder why the new bio is nowhere "
    "to be seen — scroll down.",
    "tip",
)

# ── 11. SEO ───────────────────────────────────────────────────────────────────
section("11", "The SEO tab", "Five fields, and permission to ignore most of them")

story.append(P(
    "Most records have an <b>SEO</b> tab. Everything on it is optional. Leave it "
    "empty and the site works out sensible values from the page's own title and "
    "summary — which is often the right answer."
))

story += datatable(
    ["FIELD", "WHAT IT DOES", "FILL IT IN?"],
    [
        ["Meta title",
         "The clickable blue line in Google's results. Aim for around 60 characters.",
         "When the page's own heading is too long or too vague to work as a search result."],
        ["Meta description",
         "The grey summary underneath it. Around 155 characters.",
         "Worth writing for important pages. It's your advert in the search results."],
        ["Canonical URL",
         "Tells Google that this page is really a copy of another one.",
         "<b>Leave blank.</b> Getting it wrong hides the page from Google. Ask a developer."],
        ["Hide from search engines",
         "Asks Google not to list this page at all.",
         "Only for a page you deliberately want unlisted."],
        ["Social share image",
         "The picture shown when the page is shared on Facebook or LinkedIn.",
         "Optional. A site-wide default is used when it's empty."],
    ],
    [1.35 * inch, (CONTENT_W - 1.35 * inch) * 0.48, (CONTENT_W - 1.35 * inch) * 0.52],
)

story += callout(
    "Write for a person, not for a search engine.",
    "A meta description that reads like a sentence someone would say will always "
    "outperform one stuffed with \"Houston criminal defense attorney lawyer "
    "Houston TX\". Google has been ignoring that for over a decade.",
    "tip",
)

# ── 12. Reference ─────────────────────────────────────────────────────────────
section("12", "Where everything lives", "If you know what you want to change, start here")

story.append(Paragraph("Pages", S["h2"]))
story += datatable(
    ["OPEN THIS", "TO CHANGE"],
    [
        ["Home Page",
         "The whole homepage, section by section: the hero, selling points, "
         "practice-area band, About, statement band, attorneys, firm story, "
         "testimonials, why-choose-us, reach map, press logos, FAQ and news band."],
        ["Trial Experience Page", "The trial-experience page's heading and wording. The cases themselves are in <b>Trial Results</b>."],
        ["Testimonials Page", "Headings and intro for the testimonials page. The quotes are in <b>Testimonials</b>."],
        ["Attorneys Page", "Headings and intro for the attorneys page. The people are in <b>Attorney Bios</b>."],
        ["Our Firm Page", "The firm story, values and founding-attorney sections."],
        ["Practice Areas Page", "The heading and intro above the practice-area grid."],
        ["News Page", "The heading above the news grid. Articles are in <b>News Articles</b>."],
        ["Podcast Page", "The podcast page heading and intro. Episodes are in <b>Podcast Episodes</b>."],
        ["Videos Page", "The heading above the video grid. Videos are in <b>Videos</b>."],
        ["Contact Page", "The contact page's wording."],
        ["Legal → Privacy Policy", "The privacy policy text."],
        ["Legal → Disclaimer", "The disclaimer text."],
    ],
    [1.7 * inch, CONTENT_W - 1.7 * inch],
)

story.append(PageBreak())
story.append(Paragraph("Collections", S["h2"]))
story += datatable(
    ["OPEN THIS", "TO CHANGE"],
    [
        ["Attorney Bios",
         "Each attorney: name, role, card blurb, photo, phone, email, biography, "
         "education, publications and speaking. Gives them a page at "
         "/attorney/<i>name</i>."],
        ["Practice Areas",
         "Each practice area and sub-topic. <b>Parent Page</b> is what nests one "
         "inside another and builds the web address. Holds the page body, its FAQs "
         "and the attorney who reviewed it."],
        ["Service Cities",
         "The cities the firm serves. A city is a grouping label — it has no page "
         "of its own."],
        ["Location Pages",
         "A page for one service in one city. Picks its city, and has its own hero, "
         "body and FAQs."],
        ["Videos",
         "Title plus the Wistia ID. The thumbnail and running time come from Wistia "
         "automatically — you don't type them."],
        ["FAQs",
         "Question-and-answer pairs for the site-wide FAQ section. (Practice areas "
         "keep their own separate FAQs.)"],
        ["Testimonials",
         "Client quotes and attribution, plus the <b>Feature on the homepage</b> "
         "switch — maximum three."],
        ["News Articles",
         "Press mentions. Either a link out to coverage elsewhere, or a full "
         "article hosted on this site — the <b>This item</b> field decides which."],
        ["Podcast Episodes",
         "Episode title, number, tag, artwork, show notes, the Spotify link, and "
         "the chapter list."],
        ["Trial Results",
         "Case name, outcome, write-up, which filter group it belongs to, and an "
         "optional shorter version for the homepage."],
    ],
    [1.55 * inch, CONTENT_W - 1.55 * inch],
)

story.append(Paragraph("Site Settings", S["h2"]))
story += datatable(
    ["OPEN THIS", "TO CHANGE"],
    [
        ["Firm Details",
         "Firm name, tagline, phone, email, office address, social links, logo, "
         "copyright line and footer legal links. The address also drives the "
         "footer map."],
        ["Call-to-Action Bar", "The default call-to-action band. Individual pages can override it."],
        ["Consultation Form", "The wording around the consultation form."],
        ["Fact-Checked Banner", "The small \"fact-checked\" badge wording."],
        ["Global SEO Settings", "The site-wide default share image, and the crawling switch."],
    ],
    [1.7 * inch, CONTENT_W - 1.7 * inch],
)

# ── 13. Careful ───────────────────────────────────────────────────────────────
section("13", "Please be careful with these", "Five things that are easy to do and hard to undo")

items = [
    ("Changing a slug on a live page",
     "It breaks every existing link to that page — bookmarks, Google results, "
     "links from other sites. Ask for a redirect first."),
    ("Deleting instead of unpublishing",
     "Unpublish removes it from the site and keeps it in the Studio. Delete is "
     "permanent. When in doubt, unpublish."),
    ("The Canonical URL field",
     "On the SEO tab. Filling it in incorrectly tells Google to ignore the page. "
     "Leave it blank unless a developer has asked you to set it."),
    ("The Parent Page field on practice areas",
     "It builds the web address. Changing a parent moves the page to a new "
     "address — with the same consequences as changing a slug."),
    ("\"Discourage this site from being crawled\"",
     "In Global SEO Settings. While it's on, the entire site is invisible to "
     "Google. It's on at the moment on purpose, while the site is on a temporary "
     "address. Don't switch it without checking — in either direction."),
]
rows = []
for i, (title, body) in enumerate(items, 1):
    rows.append([
        Paragraph(f'<font color="#C0451C" size="13"><b>{i}</b></font>', S["cell"]),
        Paragraph(f'<b><font color="#0C143A" size="10.5">{title}</font></b><br/>'
                  f'<font size="9.5" color="#3C4350">{body}</font>', S["cell"]),
    ])
t = Table(rows, colWidths=[0.42 * inch, CONTENT_W - 0.42 * inch])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 10),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
    ("LEFTPADDING", (0, 0), (0, -1), 0),
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
]))
story.append(t)

story.append(Spacer(1, 18))
story += callout(
    "None of this is fragile.",
    "The list above exists so you know where the sharp edges are — not to make you "
    "nervous. Everything else in the Studio can be changed, checked on the live "
    "site, and changed again. That's what it's for.",
    "tip",
)

# ── 14. FAQ ───────────────────────────────────────────────────────────────────
section("14", "Common questions", None)

qa = [
    ("I published, but the site hasn't changed.",
     "Give it two or three minutes — the site rebuilds itself after every publish. "
     "If it's still wrong after five, try a hard refresh (<b>Cmd+Shift+R</b> or "
     "<b>Ctrl+F5</b>) to get past your browser's cache."),
    ("The Publish button is greyed out.",
     "Either you haven't changed anything, or a required field is empty. Scroll up "
     "through the tabs and look for red."),
    ("Where do I change the phone number?",
     "<b>Site Settings → Firm Details</b>. Once, and it updates everywhere."),
    ("I added an attorney but can't find them on the site.",
     "New records go to the bottom of the list. Open <b>Collections → Attorney "
     "Bios</b> and drag them into position."),
    ("Can I add a brand-new page?",
     "Not a new <i>kind</i> of page — those are built in code. But you can add as "
     "many practice areas and location pages as you like, and each of those is a "
     "real page with its own address."),
    ("I deleted something by mistake.",
     "Stop and ask for help rather than trying to recreate it. The Studio keeps "
     "history, and a recent document can usually be recovered — but only if nobody "
     "has papered over it in the meantime."),
    ("There's a video on a page. Where's the file?",
     "There isn't one. Videos live in Wistia; the Studio only stores the video's "
     "ID. The thumbnail and running time are fetched from Wistia automatically."),
    ("Something looks broken and I don't think I did it.",
     "Note the page address and roughly when you noticed, and send it on. Don't "
     "unpublish the page to hide it — that removes it from Google too, and makes "
     "the original problem harder to find."),
]
rows = []
for q, a in qa:
    rows.append([Paragraph(
        f'<b><font color="#0C143A" size="10.5">{q}</font></b><br/>'
        f'<font size="9.5" color="#3C4350">{a}</font>', S["cell"])])
t = Table(rows, colWidths=[CONTENT_W])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 10),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
]))
story.append(t)

story.append(Spacer(1, 26))
story += callout(
    "Still stuck?",
    "Send the page address, what you expected, and what happened instead. Those "
    "three things answer almost every question in one reply.",
    "note",
)

# ── Build ─────────────────────────────────────────────────────────────────────
doc = BaseDocTemplate(
    OUT, pagesize=LETTER,
    leftMargin=MARGIN_X, rightMargin=MARGIN_X,
    topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOT,
    title="Cogdell Law Firm — Content Editor's Guide",
    author="Elite Legal Marketing",
    subject="How to update the Cogdell Law Firm website using Sanity Studio",
)
# Zero padding: the frame's content edge must line up exactly with the tables and
# callout boxes, which are all built at CONTENT_W. Leave the 6pt default in and
# paragraphs sit 6pt inboard of every box on the page.
frame = Frame(MARGIN_X, MARGIN_BOT, CONTENT_W,
              PAGE_H - MARGIN_TOP - MARGIN_BOT, id="main",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[frame], onPage=cover_page),
    PageTemplate(id="body", frames=[frame], onPage=body_page),
])
doc.build(story)
print("wrote", OUT)
