# PDF Generator

A flexible system for converting directories containing Markdown files into professional PDF documents.

## Features

- **Automatic file combining**: Combines all `.md` files in a directory alphabetically
- **Title page support**: If `title-page.md` exists, it will appear first
- **Page breaks**: Single (`#`) and double (`##`) hash headers create new pages
- **Table of contents**: Automatically generated from `#` and `##` headers, appears after title page
- **Flexible output**: Output PDF name defaults to directory name, but can be customized
- **Professional styling**: Clean, readable PDF format with proper typography

## Usage

### Command Line Usage

```bash
# Generate PDF from a directory (output: dist/directory-name.pdf)
python3 scripts/generate_pdf.py /path/to/markdown-directory/

# Custom output location
python3 scripts/generate_pdf.py /path/to/markdown-directory/ -o my-document.pdf

# Custom output directory
python3 scripts/generate_pdf.py /path/to/markdown-directory/ --dist-dir ./output/

# Generate PDF without table of contents
python3 scripts/generate_pdf.py /path/to/markdown-directory/ --no-toc
```

## File Processing Rules

### File Order

1. **Title page first**: If `title-page.md` exists, it appears first
2. **Table of contents**: Generated from headers and placed after title page (unless `--no-toc`)
3. **README files ignored**: Files starting with `README` are automatically excluded
4. **Alphabetical order**: All other `.md` files are processed alphabetically
5. **Automatic separation**: Files are separated with horizontal rules

### Page Breaks

- `# Header` creates a new page
- `## Header` creates a new page
- `### Header` and below do not create page breaks

### Table of Contents

- Automatically generated from `#` and `##` headers in main content (not title page)
- Always appears after title page but before main content
- Nested structure: `#` headers are level 1, `##` headers are level 2
- Clickable links to sections
- Can be disabled with `--no-toc` option

## Dependencies

Install required Python packages:

```bash
pip install -r requirements-pdf.txt
```

Required system dependencies:

- **Python 3**: For running the generator
- **Chrome/Chromium**: For PDF generation (falls back to HTML if not available)

## Command-Line Options

| Option         | Description                          | Example                |
| -------------- | ------------------------------------ | ---------------------- |
| `-o, --output` | Custom output filename               | `-o manual.pdf`        |
| `--dist-dir`   | Custom output directory              | `--dist-dir ./output/` |
| `--no-toc`     | Disable table of contents generation | `--no-toc`             |

## Examples

### Basic Usage

```bash
# Generate PDF for lab instructions
python3 scripts/generate_pdf.py ./lab-instructions/

# This creates: dist/lab-instructions.pdf
```

### With Custom Output

```bash
# Generate with custom filename
python3 scripts/generate_pdf.py ./slides-source/ -o course-slides-v2.pdf

# This creates: dist/course-slides-v2.pdf
```

### Directory Structure Example

```
my-docs/
├── title-page.md       # Will appear first
├── README.md           # Will be ignored
├── 01-introduction.md  # Will appear second
├── 02-basics.md        # Will appear third
└── 99-conclusion.md    # Will appear last
```

## Output

The generated PDF includes:

- **Title page** (if title-page.md exists)
- **Table of contents** with clickable links
- **All markdown files** combined with proper page breaks
- **Professional styling** with consistent typography
- **Code highlighting** for code blocks
- **Table formatting** for markdown tables

## Migration from Legacy System

The new system is backward compatible. Existing workflows using `generate_slides_pdf_simple.py` will continue to work, but new projects should use the generalized `generate_pdf.py` for better flexibility and features.

## Troubleshooting

### PDF Generation Fails

If automatic PDF generation fails, the system will create an HTML file instead:

1. Open the generated `.html` file in Chrome/Chromium
2. Use **Print > Save as PDF** to create the PDF manually
3. Ensure page settings are set to A4 with proper margins

### Missing Dependencies

```bash
# Install Python dependencies
pip install -r requirements-pdf.txt

# Install Chrome/Chromium (macOS)
brew install --cask google-chrome
```

### File Encoding Issues

- Ensure all `.md` files use UTF-8 encoding
- Check for special characters that might cause parsing issues
