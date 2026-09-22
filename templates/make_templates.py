"""Builds the three WatzThis pdf-generator templates from one shared stylesheet.

Values come from the WatzThis design system tokens (light theme).
"""
import base64
from pathlib import Path

HERE = Path(__file__).parent
MARK = 'data:image/png;base64,' + base64.b64encode((HERE / 'mark.png').read_bytes()).decode()

FONTS = ('@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700'
         '&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400'
         '&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap");')

TOKENS = """
      :root {
        /* WatzThis design system tokens (light theme) */
        --paper: #ffffff;
        --paper-warm: #f5f3ee;
        --line: #d9d6cf;
        --ink: #111111;
        --ink-muted: #595959;
        --band: #222222;
        --on-band: #ffffff;
        --blue: #105ba1;
        --blue-strong: #0b4580;
        --blue-soft: #e3edf7;
        --success: #1e7a46;
        --success-soft: #e4f3ea;
        --warning: #8a5300;
        --warning-soft: #fbf0dc;
        --danger: #b3261e;
        --danger-soft: #fbe7e5;
        --code-bg: #1e1e1e;
        --code-ink: #e6e6e6;
        --font-serif: 'Source Serif 4', Georgia, 'Times New Roman', serif;
        --font-sans: 'Source Sans 3', 'Segoe UI', Arial, sans-serif;
        --font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      }
"""

BASE = """
      * { box-sizing: border-box; }
      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family: var(--font-sans);
        font-size: 11pt;
        line-height: 1.6;
      }

      /* Headings */
      h1, h2, h3, h4 { color: var(--ink); break-after: avoid; page-break-after: avoid; }
      h1 {
        font-family: var(--font-serif);
        font-weight: 600;
        font-size: 26pt;
        line-height: 1.15;
        letter-spacing: -0.01em;
        margin: 0 0 18pt;
        padding-bottom: 10pt;
        border-bottom: 2pt solid var(--ink);
      }
      h1.main-title { page-break-before: always; break-before: page; }
      h2 {
        font-family: var(--font-serif);
        font-weight: 600;
        font-size: 17pt;
        line-height: 1.25;
        margin: 22pt 0 8pt;
      }
      h3 { font-size: 13pt; font-weight: 700; line-height: 1.3; margin: 18pt 0 6pt; }
      h4 { font-size: 11.5pt; font-weight: 700; line-height: 1.35; margin: 14pt 0 4pt; }

      /* Text */
      p { margin: 0 0 8pt; text-align: left; orphans: 3; widows: 3; }
      p.subhead { margin: 12pt 0 4pt; break-after: avoid; page-break-after: avoid; }
      a { color: var(--blue); text-decoration: underline; }
      strong { font-weight: 700; }
      ul, ol { margin: 0 0 10pt; padding-left: 1.4em; }
      li { margin-bottom: 3pt; }
      ul > li::marker { color: var(--blue); }
      ol > li::marker { font-weight: 700; }
      hr { border: 0; border-top: 0.75pt solid var(--line); margin: 16pt 0; }
      img { max-width: 100%; height: auto; }

      /* Key practice: the one takeaway line */
      p.key-practice {
        background: var(--blue-soft);
        border-top: 2pt solid var(--blue);
        padding: 8pt 12pt;
        margin: 12pt 0;
        font-weight: 600;
        break-inside: avoid;
      }
      p.key-practice > strong:first-child {
        display: block;
        font-size: 8pt;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--blue-strong);
        margin-bottom: 2pt;
      }

      /* Callouts: **Note:**, **Tip:**, **Caution:**, **Warning:**, **Important:** */
      p.callout {
        background: var(--blue-soft);
        border: 0.75pt solid var(--blue);
        border-radius: 3pt;
        padding: 8pt 12pt;
        margin: 10pt 0;
        break-inside: avoid;
      }
      p.callout > strong:first-child {
        font-size: 8pt;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--blue-strong);
        margin-right: 4pt;
      }
      p.callout-tip { background: var(--success-soft); border-color: var(--success); }
      p.callout-tip > strong:first-child { color: var(--success); }
      p.callout-caution { background: var(--warning-soft); border-color: var(--warning); }
      p.callout-caution > strong:first-child { color: var(--warning); }
      p.callout-warning, p.callout-important { background: var(--danger-soft); border-color: var(--danger); }
      p.callout-warning > strong:first-child,
      p.callout-important > strong:first-child { color: var(--danger); }

      /* Instructor notes (instructor edition only) */
      .instructor-notes {
        background: var(--paper-warm);
        border: 0.75pt dashed var(--ink-muted);
        padding: 8pt 12pt;
        margin: 12pt 0;
        font-size: 9.5pt;
        line-height: 1.45;
        break-inside: avoid;
      }
      .instructor-notes p.instructor-notes-label {
        font-size: 8pt;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-muted);
        margin: 0 0 4pt;
      }
      .instructor-notes ul { margin: 0; }
      .instructor-notes li::marker { color: var(--ink-muted); }

      /* Code: dark blocks for source code, light blocks for prompts */
      code {
        font-family: var(--font-mono);
        font-size: 0.88em;
        background: var(--paper-warm);
        border: 0.5pt solid var(--line);
        border-radius: 2pt;
        padding: 0 0.25em;
      }
      pre {
        margin: 10pt 0;
        padding: 10pt 12pt;
        background: var(--code-bg);
        color: var(--code-ink);
        border-radius: 0;
        font-family: var(--font-mono);
        font-size: 9pt;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        break-inside: avoid;
      }
      pre code { background: none; border: 0; padding: 0; font-size: inherit; color: inherit; }
      /* Fences with no language (prompts, model output) and text/markdown fences */
      pre:has(> code[class="language-"]),
      pre:has(> code.language-text),
      pre:has(> code.language-txt),
      pre:has(> code.language-plaintext),
      pre:has(> code.language-prompt),
      pre:has(> code.language-markdown),
      pre:has(> code.language-md) {
        background: var(--paper-warm);
        color: var(--ink);
        border: 0.75pt solid var(--line);
        border-top: 2pt solid var(--ink);
      }

      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10pt 0 14pt;
        font-size: 9.5pt;
        line-height: 1.4;
      }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }
      th {
        text-align: left;
        font-weight: 700;
        background: var(--paper-warm);
        border-bottom: 1.5pt solid var(--ink);
        padding: 5pt 8pt;
      }
      td { border-bottom: 0.75pt solid var(--line); padding: 5pt 8pt; vertical-align: top; }

      /* Title page */
      .title-page { position: relative; padding-top: 1.1in; }
      .title-page::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 0.9in;
        height: 0.9in;
        background: url("{{MARK}}") no-repeat center / contain;
      }
      .title-page h1.main-title {
        page-break-before: avoid;
        break-before: auto;
        font-size: 34pt;
        line-height: 1.1;
        border-bottom: 0;
        padding-bottom: 0;
        margin: 0 0 8pt;
      }
      .title-page h1 + p {
        font-size: 9pt;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--blue);
        padding-bottom: 18pt;
        border-bottom: 2pt solid var(--ink);
        margin-bottom: 6pt;
      }
      .title-page h1 + p strong { font-weight: 700; }
      .title-page hr { display: none; }
      .title-page h2 {
        page-break-before: auto;
        break-before: auto;
        font-family: var(--font-sans);
        font-size: 8pt;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-muted);
        margin: 16pt 0 4pt;
      }
      .title-page p, .title-page li { font-size: 10pt; }
      .title-page p { margin-bottom: 3pt; }
      .title-page > p:last-child { margin-top: 18pt; font-size: 8pt; color: var(--ink-muted); }

      /* Table of contents */
      .toc { page-break-before: always; break-before: page; }
      .toc h2 {
        font-size: 26pt;
        margin: 0 0 18pt;
        padding-bottom: 10pt;
        border-bottom: 2pt solid var(--ink);
      }
      .toc ul { list-style: none; padding-left: 0; margin: 0; }
      .toc ul ul { padding-left: 16pt; margin: 2pt 0 8pt; }
      .toc li { margin: 0; }
      .toc a { color: var(--ink); text-decoration: none; }
      .toc-level-1 {
        font-weight: 700;
        font-size: 11pt;
        border-bottom: 0.75pt solid var(--line);
        padding: 6pt 0 3pt;
      }
      .toc-level-2 { font-size: 10pt; padding: 2pt 0; }
      .toc-level-2 a { color: var(--ink-muted); }
"""

PAGE_PORTRAIT = """
      @page {
        size: A4;
        margin: 1in 0.75in;
        @bottom-left {
          content: "{{title_css}}";
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-size: 8pt;
          color: #595959;
        }
        @bottom-right {
          content: counter(page);
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-size: 8pt;
          color: #595959;
        }
      }
      @page :first {
        @bottom-left { content: none; }
        @bottom-right { content: none; }
      }
"""

# Documents (labs, handouts): h2 does not force a new page; each h1 (a lab) does.
DOC = """
      h2.slide-title {
        border-top: 1.5pt solid var(--ink);
        padding-top: 8pt;
      }
      h2.slide-title + h3 { margin-top: 8pt; }
      /* Lab manuals: list only the labs in the table of contents */
      .toc ul ul { display: none; }
      .toc-level-1 { padding: 8pt 0 5pt; }
"""

# Setup guides and outlines: continuous flow, no forced breaks.
OUTLINE = """
      h1.main-title { page-break-before: auto; break-before: auto; }
      .title-page + h1.main-title,
      .toc + h1.main-title { page-break-before: always; break-before: page; }
      h2.slide-title { border-top: 1.5pt solid var(--ink); padding-top: 8pt; }
"""

# Slide handouts: US Letter landscape, one slide per page, module dividers on the band.
SLIDES = """
      @page {
        size: 11in 8.5in;
        margin: 0.6in 0.75in 0.7in;
        @bottom-left {
          content: "{{title_css}}";
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-size: 8pt;
          color: #595959;
        }
        @bottom-right {
          content: counter(page);
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-size: 8pt;
          color: #595959;
        }
      }
      @page :first {
        @bottom-left { content: none; }
        @bottom-right { content: none; }
      }
      body { font-size: 13pt; line-height: 1.45; }
      hr { display: none; }
      .title-page hr { display: none; }

      /* Day and module dividers */
      h2.slide-title {
        page-break-before: always;
        break-before: page;
        background: var(--band);
        color: var(--on-band);
        font-size: 32pt;
        line-height: 1.1;
        margin: 0 0 18pt;
        padding: 1.6in 0.5in 0.45in;
        min-height: 3.4in;
        position: relative;
      }
      h2.slide-title::after {
        content: "";
        position: absolute;
        left: 0.5in;
        bottom: 0.25in;
        width: 0.9in;
        height: 4pt;
        background: var(--blue);
      }
      h2.slide-title ~ p { font-size: 12pt; }

      /* One slide per page */
      h3 {
        page-break-before: always;
        break-before: page;
        font-family: var(--font-serif);
        font-weight: 600;
        font-size: 24pt;
        line-height: 1.2;
        margin: 0 0 14pt;
        padding: 0.35in 0.9in 10pt 0;
        border-bottom: 1.5pt solid var(--ink);
        position: relative;
      }
      h3::after {
        content: "";
        position: absolute;
        right: 0;
        top: 0.3in;
        width: 0.45in;
        height: 0.45in;
        background: url("{{MARK}}") no-repeat center / contain;
      }
      .title-page h2.slide-title {
        page-break-before: auto;
        break-before: auto;
        background: none;
        color: var(--ink-muted);
        font-family: var(--font-sans);
        font-size: 8pt;
        line-height: 1.4;
        padding: 0;
        min-height: 0;
        margin: 14pt 0 4pt;
      }
      .title-page h2.slide-title::after { content: none; }
      .title-page p { font-size: 10pt; }
      h3 ~ ul li, h3 ~ ol li { margin-bottom: 6pt; }
      p.key-practice { font-size: 13pt; margin-top: 16pt; }
      .instructor-notes { font-size: 10pt; }
      pre { font-size: 10.5pt; }
"""

HEAD = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- WatzThis brand template, generated from the WatzThis design system. Edit make_templates.py, not this file. -->
    <title>{{title}}</title>
    <style>
      """

TAIL = """    </style>
  </head>
  <body>
    {{content}}
  </body>
</html>
"""


def build(name, *parts):
    css = FONTS + TOKENS + ''.join(parts)
    html = HEAD + css + TAIL
    html = html.replace('{{MARK}}', MARK)
    (HERE / f'{name}.html').write_text(html, encoding='utf-8')


build('watzthis', PAGE_PORTRAIT, BASE, DOC)
build('watzthis-outline', PAGE_PORTRAIT, BASE, OUTLINE)
build('watzthis-slides', BASE, SLIDES)
print('built')
