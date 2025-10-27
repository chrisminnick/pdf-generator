# ./pro React Md Admin

Private admin repository containing source materials and generation scripts for the ./pro React Md course.

## Structure

- `./pro-react-md-slides-v*/` - Course presentation materials
- `./pro-react-md-labs-v*/` - Lab exercises and instructions
- `setup-and-outline/` - Course description and setup requirements
- `setup-test/` - Setup verification files
- `solutions/` - Lab solution files
- `demos/` - Course demonstration files
- `dist/` - Generated course materials (created by build script)

## Building

Run the build script to generate PDFs and prepare course materials:

```bash
npm run build
```

## Requirements

- Node.js
- Python 3.x
- pandoc
- wkhtmltopdf (for PDF generation)

## Generated Files

The build script creates:

- PDF versions of slides and labs
- Packaged course materials
- Distribution-ready files

## Course Repository

The public course repository (without admin materials) should be: `./pro-react-md`
