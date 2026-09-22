# PDF Generator Templates

This directory contains HTML templates for the PDF generator. Each template defines the styling and layout for generated PDFs.

## Available Templates

### watzthis.html, watzthis-slides.html, watzthis-outline.html (default)

- **Style**: The WatzThis design system: black and white, Source Serif 4 headings, Source Sans 3 body, JetBrains Mono code, one blue accent (#105BA1), WT mark on the title page and slides
- **Chosen automatically** when `--template` is `default` (or `watzthis`): slide directories get `watzthis-slides` (US Letter landscape, one slide per page, dark module dividers), everything else gets `watzthis` (A4, labs start on a new page, section headings don't). `--template setup-and-outline` maps to `watzthis-outline` (continuous flow).
- **Recognizes**: `**Key practice:**` lines (blue takeaway bar), `**Note:**` / `**Tip:**` / `**Caution:**` / `**Warning:**` / `**Important:**` paragraphs (callouts), instructor notes (dashed box, `--instructor` builds only), fences with no language (light prompt blocks) vs. fences with a language (dark code blocks)
- **Fonts**: loaded from Google Fonts at build time; install the three families locally for offline builds
- **Editing**: the three files are generated. Change `make_templates.py`, then run `python3 templates/make_templates.py`
- **Opt out**: `--brand none` uses the original templates exactly as before

### default.html

- **Style**: Professional, modern sans-serif design
- **Features**: Clean layout, blue accents, proper code highlighting
- **Best for**: General documentation, technical guides, lab instructions
- **File size**: Medium (0.4-0.9MB typical)
- **Font**: System sans-serif (Segoe UI, SF Pro, etc.)

### minimal.html

- **Style**: Classic, academic serif design
- **Features**: Simple black and white, minimal styling, traditional typography
- **Best for**: Academic papers, formal documents, print-friendly outputs
- **File size**: Smallest (0.3-0.7MB typical)
- **Font**: Times New Roman

### modern.html

- **Style**: Contemporary design with gradients and shadows
- **Features**: Colorful gradients, modern typography, enhanced visual elements
- **Best for**: Presentations, marketing materials, visually rich content
- **File size**: Largest (0.6-1.2MB typical)
- **Font**: Inter/system fonts with modern styling

### setup-and-outline.html

- **Style**: Professional design without page breaks
- **Features**: Continuous flow layout, no page breaks for h1/h2 headers
- **Best for**: Course setup guides, course descriptions, continuous documents
- **File size**: Medium (0.4-0.8MB typical)
- **Font**: System sans-serif (Segoe UI, SF Pro, etc.)
- **Note**: Based on default template but removes automatic page breaks for headers

## Usage

Use the `--template` parameter to specify a template:

```bash
# Use default template (can be omitted)
python generate_pdf.py ./docs --template default

# Use minimal template
python generate_pdf.py ./docs --template minimal

# Use modern template
python generate_pdf.py ./docs --template modern

# Use setup-and-outline template (no page breaks)
python generate_pdf.py ./setup-and-outline --template setup-and-outline
```

## Creating Custom Templates

To create a custom template:

1. Create a new `.html` file in this directory
2. Use `{{title}}` placeholder for the document title
3. Use `{{content}}` placeholder where the markdown content should be inserted
4. Define your CSS styles within `<style>` tags
5. Test with `--template your-template-name` (without .html extension)

## Template Structure

Each template should have this basic structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
    <style>
      @page {
        size: A4;
        margin: 1in;
      }
      /* Your CSS styles here */
    </style>
  </head>
  <body>
    {{content}}
  </body>
</html>
```

## Important CSS Classes

Make sure to include these classes in your templates for proper functionality:

- `.page-break`: Triggers page breaks
- `.title-page`: Styles for title page content
- `.toc`: Table of contents container
- `.toc-level-1`, `.toc-level-2`: TOC hierarchy levels
- `.slide-title`, `.main-title`: Header styles that should trigger page breaks
- `pre`, `code`: Code block styling
- `table`, `th`, `td`: Table styling
