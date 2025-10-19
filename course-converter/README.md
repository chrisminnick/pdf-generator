# Course Converter

A tool to convert courses from PowerPoint slides (.pptx) and Word lab documents (.docx) to the standardized markdown format used by the pdf-generator system.

## Features

- **Converts PPTX slides** to markdown using pandoc
- **Converts DOCX lab files** to markdown using pandoc
- **Creates proper course structure** following modern-frontend-web-dev-admin template
- **Generates build.js, package.json** and other necessary files
- **Splits labs into individual files** automatically
- **Formats markdown** according to course standards
- **Copies existing course materials** (demos, solutions, setup-test)

## Prerequisites

1. **Node.js** (LTS version)
2. **pandoc** - Install with: `brew install pandoc` (macOS) or see [pandoc.org](https://pandoc.org/installing.html)
3. **Source course directory** containing `.pptx` and/or `.docx` files

## Installation

```bash
cd course-converter
npm install
```

## Usage

### Basic Usage

```bash
node convert-course.js <source-course-dir> <output-course-name>
```

### Examples

```bash
# Convert the advanced-react course
node convert-course.js ../advanced-react advanced-react-admin

# Convert with verbose output
node convert-course.js ../my-course my-course-admin --verbose

# Dry run to see what would be done
node convert-course.js ../test-course test-course-admin --dry-run
```

## Command Line Options

- `--verbose` - Show detailed output during conversion
- `--dry-run` - Show what would be done without making changes

## Input Requirements

Your source course directory should contain:

### Required Files

- **Slides**: One or more `.pptx` files (e.g., `course-slides.pptx`)
- **Labs**: One or more `.docx` files with "lab" in the filename (e.g., `course-labs.docx`)

### Optional Directories

- `demos/` - Course demonstration files
- `solutions/` - Lab solution files
- `setup-test/` - Setup verification files

## Output Structure

The converter creates a complete course admin directory structure:

```
output-course-name/
├── package.json                    # Generated package configuration
├── build.js                        # Generated build script
├── README.md                       # Generated course README
├── SCRIPTS.md                      # Generated build documentation
├── course-name-slides-v1.0.0/     # Converted slides
│   ├── course-name-slides-v1.0.0.md
│   ├── title-page.md
│   └── media/                      # Extracted images
├── course-name-labs-v1.0.0/       # Converted labs
│   ├── README.md
│   ├── title-page.md
│   ├── lab01.md                    # Individual lab files
│   ├── lab02.md
│   └── ...
├── setup-and-outline/             # Generated course info
│   ├── course-description-and-outline.md
│   └── setup-guide.md
├── setup-test/                     # Copied or created
├── solutions/                      # Copied or created
├── demos/                          # Copied or created
├── images/                         # Created
└── dist/                           # Created (for build output)
```

## Conversion Process

1. **Validates** source directory and checks for pandoc
2. **Creates** output directory structure
3. **Converts slides** from .pptx to markdown
4. **Converts labs** from .docx to markdown and splits into individual files
5. **Copies** existing course materials (demos, solutions, setup-test)
6. **Generates** build.js, package.json, and support files
7. **Creates** setup and outline documentation

## Post-Conversion Steps

After conversion, you can:

1. **Review and edit** the generated markdown files
2. **Run the build** to generate PDFs:
   ```bash
   cd output-course-name
   npm run build
   ```
3. **Customize** the course structure as needed
4. **Add to version control**:
   ```bash
   git init
   git add .
   git commit -m "Initial course conversion"
   ```

## Customization

### Markdown Post-Processing

The converter automatically:

- Cleans up pandoc conversion artifacts
- Fixes heading levels
- Adds proper spacing
- Splits labs into individual files

### Course Information

The converter extracts and generates:

- Course name from filenames
- Version numbers from source files
- Appropriate keywords based on course type
- Standard course structure and documentation

## Troubleshooting

### Common Issues

1. **Pandoc not found**

   ```bash
   brew install pandoc  # macOS
   # or see https://pandoc.org/installing.html
   ```

2. **No .pptx or .docx files found**

   - Ensure your source directory contains the required file types
   - Check that filenames include "lab" for lab documents

3. **Permission errors**

   - Ensure you have write permissions to the output location
   - Check that the output directory doesn't already exist with restrictive permissions

4. **Conversion errors**
   - Use `--verbose` flag to see detailed error messages
   - Check that source files are not corrupted or password-protected

### Debug Mode

Use the `--dry-run` flag to see what the converter would do without making changes:

```bash
node convert-course.js ../source-course test-output --dry-run --verbose
```

## Contributing

To improve the course converter:

1. Test with different course formats
2. Add support for additional file types
3. Improve markdown post-processing
4. Enhance error handling and validation

## License

ISC License - See individual course materials for their respective licenses.
