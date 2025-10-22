# ./pro React Md Build Scripts

## Overview

This repository uses a Node.js build script to generate course materials from markdown source files.

## Available Scripts

### `npm run build`

Runs the main build process:

1. **Clean**: Removes existing `dist/` directory
2. **Generate PDFs**: Creates PDF versions of slides and labs using the shared PDF generator
3. **Copy Materials**: Copies setup-test, solutions, and demos to distribution directory
4. **Package**: Prepares final course materials

## Build Process Details

### PDF Generation

The build script uses the shared PDF generator located at `../pdf-generator/` to create:

- **Slides PDF**: Combined presentation materials
- **Labs PDF**: All lab exercises in sequence
- **Individual Lab PDFs**: Separate PDF for each lab (optional)

### File Processing

- Automatically combines markdown files from specified directories
- Handles title pages and table of contents
- Ignores README files during PDF generation
- Preserves directory structure for supporting materials

### Output Structure

```
dist/
├── ./pro-react-md-slides.pdf
├── ./pro-react-md-labs.pdf
├── setup-test/
├── solutions/
└── demos/
```

## Customization

To modify the build process:

1. Edit `build.js` for custom logic
2. Update PDF generator templates in `../pdf-generator/templates/`
3. Modify directory mappings in the build configuration

## Dependencies

- **Node.js**: JavaScript runtime for build scripts
- **Python 3**: Required for PDF generator
- **pandoc**: Document conversion (installed via PDF generator requirements)
- **wkhtmltopdf**: PDF generation engine (installed via PDF generator requirements)

## Troubleshooting

### PDF Generation Issues

1. Check that the PDF generator is available at `../pdf-generator/`
2. Ensure Python dependencies are installed: `pip install -r ../pdf-generator/requirements-pdf.txt`
3. Verify pandoc installation: `pandoc --version`

### Build Script Issues

1. Check Node.js version compatibility
2. Verify all source directories exist
3. Review build.js console output for specific errors

## Manual PDF Generation

You can also generate PDFs manually using the PDF generator directly:

```bash
python ../pdf-generator/scripts/generate_pdf.py \
  --input-dir "./pro-react-md-slides-v*/" \
  --output-file "dist/./pro-react-md-slides.pdf" \
  --title "./pro React Md Slides"
```
