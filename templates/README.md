# PDF Generator Templates

This directory contains HTML templates for the PDF generator. Each template defines the styling and layout for generated PDFs.

## Available Templates

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

## Usage

Use the `--template` parameter to specify a template:

```bash
# Use default template (can be omitted)
python generate_pdf.py ./docs --template default

# Use minimal template
python generate_pdf.py ./docs --template minimal

# Use modern template
python generate_pdf.py ./docs --template modern
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
