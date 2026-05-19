# AGENTS

Agent operating guide for this repository.

## Project map

- PDF generator (Python): [scripts/generate_pdf.py](scripts/generate_pdf.py)
- Course converter (Node.js): [course-converter/convert-course.js](course-converter/convert-course.js)
- Converter batch runner: [course-converter/batch-convert.js](course-converter/batch-convert.js)
- PDF templates: [templates/README.md](templates/README.md)
- Primary docs: [README.md](README.md), [course-converter/README.md](course-converter/README.md)

## Fast start commands

Run from repository root unless noted.

- Install Python deps: `pip install -r requirements-pdf.txt`
- Generate a PDF: `python3 scripts/generate_pdf.py /path/to/markdown-dir`
- Generate PDF without TOC: `python3 scripts/generate_pdf.py /path/to/markdown-dir --no-toc`

Run from [course-converter](course-converter).

- Install Node deps: `npm install`
- Convert a course: `node convert-course.js <source-dir> <output-name>`
- Dry-run conversion: `node convert-course.js <source-dir> <output-name> --dry-run --verbose`
- Run converter checks: `npm test`

## Required tools and assumptions

- Node.js 14+ for converter scripts ([course-converter/package.json](course-converter/package.json)).
- `pandoc` is required for conversions.
- LibreOffice is optional; without it, slide conversion falls back to placeholders.
- Converter output directory is removed and recreated if it already exists.

## Repository-specific behavior

- PDF input ordering: `title-page.md` first (if present), then other `.md` files alphabetically.
- Markdown files starting with `README` are excluded from generated PDFs.
- TOC only includes `#` and `##` headings.
- Instructor notes are removed by default in PDF generation unless explicitly enabled in code paths.

## Editing guidance for agents

- Keep changes scoped. Do not reformat unrelated sections.
- Prefer preserving current script styles:
  - Python scripts are function-heavy and use `pathlib`.
  - Node scripts use CommonJS, class-based orchestration, and explicit process exits on fatal errors.
- For converter workflow or CLI changes, also update [course-converter/README.md](course-converter/README.md).
- For template-related behavior, update docs in [templates/README.md](templates/README.md).

## Validation checklist

After relevant edits:

- Python path: run a representative `python3 scripts/generate_pdf.py ...` command.
- Converter path: run `npm test` in [course-converter](course-converter), then run a `--dry-run` conversion.
- If command prerequisites are missing locally, report that clearly in the handoff.

## Additional context

- Converter implementation notes: [course-converter/PROJECT-SUMMARY.md](course-converter/PROJECT-SUMMARY.md)
- Code block fix details: [course-converter/CODE-BLOCK-FIX-SUMMARY.md](course-converter/CODE-BLOCK-FIX-SUMMARY.md)
