"""Shared layout engine for the Elite Legal Marketing PDF guides.

Extracted from build-content-guide.py so a second guide doesn't mean a second
copy of 250 lines of reportlab furniture. A guide script is then only its own
words: build a GuideConfig, make a Guide, call the helpers, call build().

    from guide_kit import Guide, GuideConfig

    g = Guide(GuideConfig(firm_name="...", out_path="...", ...))
    g.contents([("1", "Start here", "..."), ...])
    g.section("1", "Start here", "...")
    g.p("Some words.")
    g.build()

Set up once, then rebuild whenever the Studio changes:

    python3 -m venv /tmp/guide-venv
    /tmp/guide-venv/bin/pip install reportlab
    /tmp/guide-venv/bin/python docs/build-<name>-guide.py

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

from contextlib import contextmanager
from dataclasses import dataclass

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

COVER_SUB = colors.HexColor("#AEB6CC")
COVER_FOOT = colors.HexColor("#9AA1AE")

PAGE_W, PAGE_H = LETTER
MARGIN_X = 0.95 * inch
MARGIN_TOP = 0.95 * inch
MARGIN_BOT = 0.85 * inch
CONTENT_W = PAGE_W - 2 * MARGIN_X

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
S["tocpart"] = ParagraphStyle(
    "tocpart", fontName="Helvetica-Bold", fontSize=9, leading=12,
    textColor=TEAL, spaceBefore=14, spaceAfter=2,
)
S["partLabel"] = ParagraphStyle(
    "partLabel", fontName="Helvetica-Bold", fontSize=9, leading=13,
    textColor=TEAL, spaceAfter=6,
)
S["partTitle"] = ParagraphStyle(
    "partTitle", fontName="Helvetica-Bold", fontSize=26, leading=30,
    textColor=colors.white, spaceAfter=0,
)
S["partSub"] = ParagraphStyle(
    "partSub", fontName="Helvetica", fontSize=11, leading=16,
    textColor=COVER_SUB, spaceBefore=7, spaceAfter=0,
)
S["tocnum"] = ParagraphStyle(
    "tocnum", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=TEAL,
)
# A path, field name or URL set in the middle of a sentence. Helvetica-Oblique
# rather than Courier: a monospace run at 10pt reads a full size smaller than the
# body around it and pockmarks the paragraph.
S["mono"] = ParagraphStyle(
    "mono", fontName="Courier", fontSize=9.5, leading=14, textColor=NAVY,
)


def esc(t):
    """Escape a string that will be dropped into reportlab's mini-HTML."""
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def spaced(t, gap="  "):
    """C O V E R   E Y E B R O W — letter-spaced, since Helvetica has no tracking."""
    return gap.join(t.upper())


@dataclass
class GuideConfig:
    """Everything that changes from one site's guide to the next.

    Swapping these dozen values plus the guide's own prose is the whole job of
    producing this deliverable for another firm.
    """

    out_path: str                     # absolute path of the PDF to write
    firm_name: str                    # "Cogdell Law Firm"
    cover_title: list                 # up to two lines, ~18 chars each at 33pt
    cover_subtitle: str
    running_head: str                 # repeated at the top of every body page
    pdf_title: str                    # window title / file metadata
    pdf_subject: str
    prepared_by: str = "Prepared by Elite Legal Marketing"
    edition: str = ""                 # "August 2026  ·  Version 1.0"
    cover_eyebrow: str = ""           # defaults to the letter-spaced firm name
    author: str = "Elite Legal Marketing"
    contents_heading: str = "What's in this guide"

    def __post_init__(self):
        if not self.cover_eyebrow:
            # A single-space join already widens the word gaps to three, because
            # the name's own spaces are joined too.
            self.cover_eyebrow = spaced(self.firm_name)


class Guide:
    """Accumulates flowables, then writes the PDF."""

    def __init__(self, cfg: GuideConfig):
        self.cfg = cfg
        self.story = []
        # Running head per page template, keyed by template id. A guide with
        # parts gets one template each so the head can name the part you're in;
        # a guide without them just uses "body".
        self._heads = {"body": cfg.running_head}
        self._banner_open = False
        # The cover is its own page template; everything after it is "body".
        self.story.append(NextPageTemplate("body"))
        self.story.append(PageBreak())

    # ── Parts ─────────────────────────────────────────────────────────────────
    def part(self, label, title, subtitle=None):
        """Open a numbered part — a banner, and a running head that names it.

        A banner at the top of a page rather than a divider page of its own:
        two mostly-blank pages in a reference document are two more pages to
        page past. The part gets its own page template purely so the running
        head can change, which is what actually helps someone who opened the
        PDF in the middle.
        """
        tid = f"part{len(self._heads)}"
        self._heads[tid] = f"{self.cfg.running_head}  ·  {label.upper()}"
        self.story.append(NextPageTemplate(tid))
        self.story.append(PageBreak())

        inner = [Paragraph(spaced(label), S["partLabel"]),
                 Paragraph(title, S["partTitle"])]
        if subtitle:
            inner.append(Paragraph(subtitle, S["partSub"]))
        t = Table([[inner]], colWidths=[CONTENT_W])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), NAVY),
            ("LEFTPADDING", (0, 0), (-1, -1), 22),
            ("RIGHTPADDING", (0, 0), (-1, -1), 22),
            ("TOPPADDING", (0, 0), (-1, -1), 22),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 24),
            ("LINEBELOW", (0, 0), (-1, -1), 3, TEAL),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        t.spaceBefore, t.spaceAfter = 0, 22
        self.story.append(t)
        # The banner already opened a page, so the section that follows must not
        # open another — a page holding nothing but a part banner is a page the
        # reader pages past. Consumed by the next section() call.
        self._banner_open = True

    # ── Blocks ────────────────────────────────────────────────────────────────
    def contents(self, entries):
        """The table of contents page.

        An entry is (number, title, blurb) for a section, or a bare string for
        a part heading that groups the sections under it.
        """
        self.story.append(Paragraph(self.cfg.contents_heading, S["h1"]))
        self.story.append(Spacer(1, 14))
        rows, style = [], [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (0, -1), 0),
        ]
        for e in entries:
            i = len(rows)
            if isinstance(e, str):
                # Rendered verbatim: letter-spacing a string containing an em
                # dash pushes the dash out into its own island.
                rows.append([Paragraph(e, S["tocpart"]), ""])
                style += [("SPAN", (0, i), (-1, i)),
                          ("TOPPADDING", (0, i), (-1, i), 15)]
            else:
                num, title, blurb = e
                rows.append([
                    Paragraph(num, S["tocnum"]),
                    Paragraph(f'<b>{title}</b><br/>'
                              f'<font color="#767E8C" size="9">{blurb}</font>',
                              S["toc"]),
                ])
                # Rule under every section row except the last, and never under
                # a part heading — a rule there reads as a table border.
                if i + 1 < len(entries) and not isinstance(entries[i + 1], str):
                    style.append(("LINEBELOW", (0, i), (-1, i), 0.5, RULE))
        t = Table(rows, colWidths=[0.4 * inch, CONTENT_W - 0.4 * inch])
        t.setStyle(TableStyle(style))
        self.story.append(t)

    def section(self, number, title, subtitle=None, newpage=True):
        if self._banner_open:
            newpage, self._banner_open = False, False
        if newpage:
            self.story.append(PageBreakIfNotEmpty())
        self.story.append(
            Paragraph(f'<font color="#0199A6">{number}.</font>  {title}', S["h1"]))
        if subtitle:
            self.story.append(Paragraph(subtitle, S["h1sub"]))
        else:
            self.story.append(Spacer(1, 10))

    def h2(self, text):
        self.story.append(Paragraph(text, S["h2"]))

    def h3(self, text):
        self.story.append(Paragraph(text, S["h3"]))

    def p(self, text, style="body"):
        self.story.append(Paragraph(text, S[style]))

    def space(self, height=10):
        self.story.append(Spacer(1, height))

    @contextmanager
    def keep(self):
        """Hold everything inside the block on one page.

        For a heading and the short list under it: without this, reportlab is
        happy to leave the heading at the foot of one page and spill the last
        bullet onto the next, which reads as a three-line orphan page. Only use
        it on blocks comfortably shorter than a page — reportlab places an
        over-tall KeepTogether anyway, but it wastes the page it tried on first.
        """
        outer, self.story = self.story, []
        try:
            yield
        finally:
            inner, self.story = self.story, outer
            self.story.append(KeepTogether(inner))

    def bullets(self, items, style="bullet"):
        self.story += [Paragraph(t, S[style], bulletText="•") for t in items]

    def steps(self, items):
        self.story += [
            Paragraph(t, S["step"], bulletText=f"{i}.")
            for i, t in enumerate(items, 1)
        ]

    def callout(self, title, text, kind="tip"):
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
        # spaceBefore/spaceAfter rather than Spacer flowables: trailing space set
        # this way is discarded at a page boundary, where a Spacer would flow onto
        # the next page and leave a stranded blank one behind a section break.
        t.spaceBefore, t.spaceAfter = 4, 12
        self.story.append(t)

    def table(self, header, rows, widths):
        """widths are FRACTIONS of the content width and must sum to 1.

        Fractions rather than inches so a column can be re-balanced without
        recomputing the others, and so the page size stays a kit concern.
        """
        cols = [CONTENT_W * w for w in widths]
        data = [[Paragraph(h, S["cellhead"]) for h in header]]
        for r in rows:
            data.append(
                [Paragraph(r[0], S["cellb"])]
                + [Paragraph(c, S["cell"]) for c in r[1:]]
            )
        t = Table(data, colWidths=cols, repeatRows=1)
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
        self.story.append(t)

    def qa(self, pairs):
        """A run of question/answer blocks — the closing FAQ shape."""
        rows = [
            [Paragraph(
                f'<b><font color="#0C143A" size="10.5">{q}</font></b><br/>'
                f'<font size="9.5" color="#3C4350">{a}</font>', S["cell"])]
            for q, a in pairs
        ]
        t = Table(rows, colWidths=[CONTENT_W])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
        ]))
        self.story.append(t)

    def code(self, text):
        """A monospace block — a URL, a path, the contents of a file.

        Newlines become explicit line breaks. A Paragraph treats "\\n" as
        ordinary whitespace, so a multi-line block would otherwise reflow into
        one long wrapped line — exactly wrong for showing a file's contents.
        """
        body = "<br/>".join(esc(line) for line in text.split("\n"))
        t = Table([[Paragraph(body, S["mono"])]], colWidths=[CONTENT_W])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PAPER),
            ("LEFTPADDING", (0, 0), (-1, -1), 13),
            ("RIGHTPADDING", (0, 0), (-1, -1), 13),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ("LINEBEFORE", (0, 0), (0, -1), 3, NAVY_SOFT),
        ]))
        t.spaceBefore, t.spaceAfter = 4, 12
        self.story.append(t)

    # ── Page furniture ────────────────────────────────────────────────────────
    def _cover_page(self, canvas, doc):
        cfg = self.cfg
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, PAGE_H - 4.55 * inch, PAGE_W, 4.55 * inch, stroke=0, fill=1)
        canvas.setFillColor(TEAL)
        canvas.rect(0, PAGE_H - 4.62 * inch, PAGE_W, 0.07 * inch, stroke=0, fill=1)

        canvas.setFillColor(TEAL)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(MARGIN_X, PAGE_H - 1.5 * inch, cfg.cover_eyebrow)

        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 33)
        y = PAGE_H - 2.42 * inch
        for line in cfg.cover_title:
            canvas.drawString(MARGIN_X, y, line)
            y -= 0.53 * inch

        canvas.setFillColor(COVER_SUB)
        canvas.setFont("Helvetica", 12.5)
        canvas.drawString(MARGIN_X, PAGE_H - 3.62 * inch, cfg.cover_subtitle)

        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 9.5)
        canvas.drawString(MARGIN_X, 1.28 * inch, cfg.prepared_by)
        if cfg.edition:
            canvas.setFillColor(COVER_FOOT)
            canvas.drawString(MARGIN_X, 1.06 * inch, cfg.edition)
        canvas.restoreState()

    def _body_painter(self, head):
        """One painter per page template, closed over that template's head."""
        def paint(canvas, doc):
            self._body_page(canvas, doc, head)
        return paint

    def _body_page(self, canvas, doc, head):
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN_X, PAGE_H - 0.66 * inch,
                    PAGE_W - MARGIN_X, PAGE_H - 0.66 * inch)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(MARGIN_X, PAGE_H - 0.58 * inch, head)

        canvas.line(MARGIN_X, 0.72 * inch, PAGE_W - MARGIN_X, 0.72 * inch)
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(MUTED)
        # The cover is page 1 and carries no number, so the count starts on the
        # contents page.
        canvas.drawRightString(PAGE_W - MARGIN_X, 0.52 * inch,
                               str(canvas.getPageNumber() - 1))
        canvas.restoreState()

    # ── Build ─────────────────────────────────────────────────────────────────
    def build(self):
        cfg = self.cfg
        doc = BaseDocTemplate(
            cfg.out_path, pagesize=LETTER,
            leftMargin=MARGIN_X, rightMargin=MARGIN_X,
            topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOT,
            title=cfg.pdf_title, author=cfg.author, subject=cfg.pdf_subject,
        )
        # Zero padding: the frame's content edge must line up exactly with the
        # tables and callout boxes, which are all built at CONTENT_W. Leave the
        # 6pt default in and paragraphs sit 6pt inboard of every box on the page.
        frame = Frame(MARGIN_X, MARGIN_BOT, CONTENT_W,
                      PAGE_H - MARGIN_TOP - MARGIN_BOT, id="main",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        doc.addPageTemplates(
            [PageTemplate(id="cover", frames=[frame], onPage=self._cover_page)]
            + [PageTemplate(id=tid, frames=[frame],
                            onPage=self._body_painter(head))
               for tid, head in self._heads.items()]
        )
        doc.build(self.story)
        print("wrote", cfg.out_path)
