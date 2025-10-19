#!/usr/bin/env node

/**
 * Course Converter - Convert PPTX slides and DOCX labs to modern course structure
 *
 * This script converts courses from PowerPoint slides and Word documents to
 * the standardized markdown format used by the pdf-generator system.
 *
 * Features:
 * - Converts PPTX slides to markdown using pandoc
 * - Converts DOCX lab files to markdown using pandoc
 * - Creates proper course structure following modern-frontend-web-dev-admin template
 * - Generates build.js, package.json, and other necessary files
 * - Splits labs into individual files
 * - Formats markdown according to course standards
 *
 * Usage:
 *   node convert-course.js <source-course-dir> <output-course-name> [options]
 *
 * Example:
 *   node convert-course.js ../advanced-react advanced-react-admin
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TEMPLATE_DIR = '../modern-frontend-web-dev-admin';
const ROOT_DIR = path.resolve(__dirname, '..');

class CourseConverter {
  constructor(sourceDir, outputName, options = {}) {
    this.sourceDir = path.resolve(sourceDir);
    this.outputName = outputName;
    this.outputDir = path.join(ROOT_DIR, outputName);
    this.options = {
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      ...options,
    };

    this.log('📚 Course Converter Initialized');
    this.log(`   Source: ${this.sourceDir}`);
    this.log(`   Output: ${this.outputDir}`);
  }

  log(message) {
    if (this.options.verbose || !message.startsWith('   ')) {
      console.log(message);
    }
  }

  error(message) {
    console.error(`❌ ${message}`);
  }

  /**
   * Main conversion process
   */
  async convert() {
    try {
      this.log('🔄 Starting course conversion...');

      // Validate source directory
      this.validateSource();

      // Create output structure
      this.createOutputStructure();

      // Convert slides
      await this.convertSlides();

      // Convert labs
      await this.convertLabs();

      // Copy existing course materials
      this.copyCourseMaterials();

      // Generate build files
      this.generateBuildFiles();

      // Generate package.json
      this.generatePackageJson();

      // Generate README and other files
      this.generateSupportFiles();

      this.log('✅ Course conversion completed successfully!');
      this.log(`📁 Output directory: ${this.outputDir}`);
    } catch (error) {
      this.error(`Conversion failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Validate source directory has required files
   */
  validateSource() {
    if (!fs.existsSync(this.sourceDir)) {
      throw new Error(`Source directory not found: ${this.sourceDir}`);
    }

    const files = fs.readdirSync(this.sourceDir);
    const hasSlides = files.some(
      (f) => f.endsWith('.pptx') || f.endsWith('.ppt')
    );
    const hasLabs = files.some((f) => f.includes('lab') && f.endsWith('.docx'));

    if (!hasSlides && !hasLabs) {
      throw new Error(
        'No .pptx/.ppt or lab .docx files found in source directory'
      );
    }

    // Check if pandoc is available
    try {
      execSync('pandoc --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error(
        'pandoc is required but not installed. Install with: brew install pandoc'
      );
    }

    // Check if LibreOffice is available (warn if not available)
    if (hasSlides && !this.checkLibreOffice()) {
      this.log(
        '⚠️  LibreOffice not found. Slide conversion will create placeholders.'
      );
      this.log(
        '   Install LibreOffice for automatic slide conversion: brew install libreoffice'
      );
    }

    this.log('✅ Source validation passed');
  }

  /**
   * Create the output directory structure
   */
  createOutputStructure() {
    if (this.options.dryRun) {
      this.log('🔍 [DRY RUN] Would create output structure');
      return;
    }

    // Remove existing output directory if it exists
    if (fs.existsSync(this.outputDir)) {
      this.log(`🗑️  Removing existing ${this.outputName}/`);
      fs.rmSync(this.outputDir, { recursive: true, force: true });
    }

    // Create main directories
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'setup-and-outline'),
      path.join(this.outputDir, 'setup-test'),
      path.join(this.outputDir, 'solutions'),
      path.join(this.outputDir, 'demos'),
      path.join(this.outputDir, 'images'),
      path.join(this.outputDir, 'dist'),
    ];

    dirs.forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
      this.log(`📁 Created ${path.relative(ROOT_DIR, dir)}/`);
    });
  }

  /**
   * Convert PowerPoint slides to markdown using LibreOffice
   */
  async convertSlides() {
    const files = fs.readdirSync(this.sourceDir);
    const slideFiles = files.filter(
      (f) => f.endsWith('.pptx') || f.endsWith('.ppt')
    );

    if (slideFiles.length === 0) {
      this.log('⚠️  No .pptx or .ppt files found, skipping slides conversion');
      return;
    }

    // Check if LibreOffice is available
    if (!this.checkLibreOffice()) {
      this.log(
        '⚠️  LibreOffice not found, creating placeholders for slide files'
      );
      for (const slideFile of slideFiles) {
        await this.createSlidesfallback(slideFile);
      }
      return;
    }

    for (const slideFile of slideFiles) {
      this.log(`🎨 Converting slides: ${slideFile}`);

      const inputPath = path.join(this.sourceDir, slideFile);
      const courseName = this.extractCourseName(slideFile);
      const version = this.extractVersion() || '1.0.0';
      const slidesDir = path.join(
        this.outputDir,
        `${courseName}-slides-v${version}`
      );

      if (!this.options.dryRun) {
        fs.mkdirSync(slidesDir, { recursive: true });

        const outputPath = path.join(
          slidesDir,
          `${courseName}-slides-v${version}.md`
        );

        try {
          // Use LibreOffice to convert PPTX/PPT to HTML first
          this.log(
            `   🔄 Converting ${slideFile} to HTML using LibreOffice...`
          );
          const tempHtmlPath = await this.convertToHtmlWithLibreOffice(
            inputPath,
            slidesDir
          );

          // Then convert HTML to markdown using pandoc
          this.log(`   🔄 Converting HTML to Markdown using pandoc...`);
          await this.convertHtmlToMarkdown(tempHtmlPath, outputPath);

          // Clean up temporary HTML file
          if (fs.existsSync(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
          }

          this.log(
            `   ✅ Created ${path.relative(this.outputDir, outputPath)}`
          );

          // Post-process the markdown
          this.postProcessSlides(outputPath);

          // Create title page
          this.createTitlePage(slidesDir, courseName, version);
        } catch (error) {
          this.log(
            `   ⚠️  Conversion failed: ${error.message}, creating placeholder`
          );
          this.createSlidesPlaceholder(outputPath, slideFile);
          this.createTitlePage(slidesDir, courseName, version);
        }
      }
    }
  }

  /**
   * Convert Word lab documents to markdown
   */
  async convertLabs() {
    const files = fs.readdirSync(this.sourceDir);
    const labFiles = files.filter(
      (f) => f.includes('lab') && f.endsWith('.docx')
    );

    if (labFiles.length === 0) {
      this.log('⚠️  No lab .docx files found, skipping labs conversion');
      return;
    }

    for (const labFile of labFiles) {
      this.log(`📝 Converting labs: ${labFile}`);

      const inputPath = path.join(this.sourceDir, labFile);
      const courseName = this.extractCourseName(labFile);
      const version = this.extractVersion() || '1.0.0';
      const labsDir = path.join(
        this.outputDir,
        `${courseName}-labs-v${version}`
      );

      if (!this.options.dryRun) {
        fs.mkdirSync(labsDir, { recursive: true });

        // Convert with pandoc
        const tempOutputPath = path.join(labsDir, 'temp-labs.md');
        const pandocCmd = `pandoc "${inputPath}" -t markdown -o "${tempOutputPath}" --extract-media="${path.join(
          labsDir,
          'media'
        )}"`;

        try {
          execSync(pandocCmd, { stdio: 'pipe' });

          // Split the labs into individual files
          this.splitLabsIntoFiles(tempOutputPath, labsDir);

          // Remove temp file
          fs.unlinkSync(tempOutputPath);

          // Create title page and README
          this.createLabTitlePage(labsDir, courseName, version);
          this.createLabReadme(labsDir, courseName);
        } catch (error) {
          this.error(`Failed to convert ${labFile}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Copy existing course materials (demos, solutions, setup-test)
   */
  copyCourseMaterials() {
    const materialDirs = ['demos', 'solutions', 'setup-test'];

    materialDirs.forEach((dirName) => {
      const sourceDir = path.join(this.sourceDir, dirName);
      const destDir = path.join(this.outputDir, dirName);

      if (fs.existsSync(sourceDir)) {
        this.log(`📋 Copying ${dirName}/`);
        if (!this.options.dryRun) {
          this.copyDirectory(sourceDir, destDir);
        }
      } else {
        this.log(
          `⚠️  ${dirName}/ not found in source, creating empty directory`
        );
        if (!this.options.dryRun) {
          fs.mkdirSync(destDir, { recursive: true });
        }
      }
    });
  }

  /**
   * Generate build.js file based on template
   */
  generateBuildFiles() {
    this.log('🔧 Generating build.js');

    if (this.options.dryRun) {
      this.log('🔍 [DRY RUN] Would generate build.js');
      return;
    }

    const templateBuildPath = path.resolve(ROOT_DIR, TEMPLATE_DIR, 'build.js');
    const outputBuildPath = path.join(this.outputDir, 'build.js');

    if (!fs.existsSync(templateBuildPath)) {
      this.log(
        `⚠️  Template build.js not found at ${templateBuildPath}, creating basic build.js`
      );
      this.createBasicBuildFile(outputBuildPath);
      return;
    }

    // Read template and customize
    let buildContent = fs.readFileSync(templateBuildPath, 'utf8');

    // Replace course-specific content
    const courseName = this.getCourseName();
    const courseTitle = this.getCourseTitle();

    buildContent = buildContent.replace(
      /Modern Frontend Web Development/g,
      courseTitle
    );

    buildContent = buildContent.replace(
      /modern-frontend-web-dev/g,
      this.outputName.replace('-admin', '')
    );

    fs.writeFileSync(outputBuildPath, buildContent);
    this.log(`   ✅ Created build.js`);
  }

  /**
   * Generate package.json
   */
  generatePackageJson() {
    this.log('📦 Generating package.json');

    if (this.options.dryRun) {
      this.log('🔍 [DRY RUN] Would generate package.json');
      return;
    }

    const courseName = this.getCourseName();
    const courseTitle = this.getCourseTitle();

    const packageJson = {
      name: this.outputName,
      version: this.extractVersion() || '1.0.0',
      description: `Private admin repository containing source materials and generation scripts for the ${courseTitle} course.`,
      main: 'build.js',
      scripts: {
        build: 'node build.js',
      },
      repository: {
        type: 'git',
        url: `git+https://github.com/chrisminnick/${this.outputName}.git`,
      },
      keywords: this.generateKeywords(),
      author: 'Chris Minnick',
      license: 'ISC',
      type: 'commonjs',
      bugs: {
        url: `https://github.com/chrisminnick/${this.outputName}/issues`,
      },
      homepage: `https://github.com/chrisminnick/${this.outputName}#readme`,
    };

    const outputPath = path.join(this.outputDir, 'package.json');
    fs.writeFileSync(outputPath, JSON.stringify(packageJson, null, 2));
    this.log(`   ✅ Created package.json`);
  }

  /**
   * Generate README and other support files
   */
  generateSupportFiles() {
    this.log('📄 Generating support files');

    if (this.options.dryRun) {
      this.log('🔍 [DRY RUN] Would generate support files');
      return;
    }

    // Generate README.md
    this.generateReadme();

    // Generate SCRIPTS.md
    this.generateScriptsDoc();

    // Generate setup-and-outline files
    this.generateSetupOutline();
  }

  /**
   * Helper methods
   */

  extractCourseName(filename) {
    // Extract course name from filename, removing file extension and version info
    return filename
      .replace(/\.(pptx|docx)$/i, '')
      .replace(/-slides|-labs/, '')
      .replace(/[-_]/, '-')
      .toLowerCase();
  }

  extractVersion() {
    // Try to extract version from package.json if it exists
    const packagePath = path.join(this.sourceDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version;
      } catch (error) {
        // Ignore
      }
    }
    return '1.0.0';
  }

  getCourseName() {
    return this.outputName.replace('-admin', '');
  }

  getCourseTitle() {
    return this.getCourseName()
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  generateKeywords() {
    const courseName = this.getCourseName();
    const baseKeywords = ['course', 'education'];

    if (courseName.includes('react')) {
      return [
        ...baseKeywords,
        'react',
        'javascript',
        'frontend',
        'web-development',
      ];
    } else if (courseName.includes('node')) {
      return [...baseKeywords, 'nodejs', 'backend', 'javascript', 'server'];
    } else if (courseName.includes('frontend')) {
      return [
        ...baseKeywords,
        'frontend',
        'web-development',
        'html',
        'css',
        'javascript',
      ];
    }

    return [...baseKeywords, 'programming', 'web-development'];
  }

  createBasicBuildFile(outputPath) {
    const courseName = this.getCourseName();
    const courseTitle = this.getCourseTitle();
    const version = this.extractVersion() || '1.0.0';

    const buildContent = `#!/usr/bin/env node

/**
 * Build script for ${courseTitle} Course
 *
 * This script recreates the distribution directory from scratch by:
 * 1. Completely removing and recreating the dist directory
 * 2. Generating PDFs from specified directories using the generalized PDF generator
 *    - PDF names are automatically assigned from directory names
 *    - Combines markdown files from directories
 *    - Handles title pages and table of contents
 *    - Ignores README files automatically
 * 3. Copying fresh setup-test and solutions from admin repo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ADMIN_ROOT = __dirname;

// Prefer sibling public repo if it exists, otherwise use local dist/
const SIBLING_PUBLIC = path.resolve(
  ADMIN_ROOT,
  '..',
  '${courseName}'
);
const DEFAULT_DIST = path.join(ADMIN_ROOT, 'dist');
const PUBLIC_ROOT = fs.existsSync(SIBLING_PUBLIC)
  ? SIBLING_PUBLIC
  : DEFAULT_DIST;

// Resolve PDF generator path (prefer shared root-level generator, fallback to legacy local path)
function getPdfGeneratorPath() {
  const SHARED = path.resolve(
    ADMIN_ROOT,
    '..',
    'pdf-generator',
    'scripts',
    'generate_pdf.py'
  );
  const LEGACY = path.resolve(
    ADMIN_ROOT,
    'pdf-generator',
    'scripts',
    'generate_pdf.py'
  );
  if (fs.existsSync(SHARED)) return SHARED;
  if (fs.existsSync(LEGACY)) return LEGACY;
  
  console.error('❌ PDF generator not found. Checked:');
  console.error('   ', SHARED);
  console.error('   ', LEGACY);
  process.exit(1);
}

console.log('🏗️  ${courseTitle} - Build Script');
console.log('========================================================');

/**
 * Remove a directory recursively
 */
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(\`🗑️  Removing \${path.basename(dirPath)}/\`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  console.log(\`📋 Copying \${path.basename(src)}/ → \${path.basename(dest)}/\`);

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Copy using system cp command for better handling of symlinks, permissions, etc.
  try {
    execSync(\`cp -R "\${src}/." "\${dest}/"\`, { stdio: 'inherit' });
  } catch (error) {
    console.error(\`❌ Error copying \${src} to \${dest}:\`, error.message);
    process.exit(1);
  }
}

/**
 * Generate PDF from markdown directory
 */
function generatePdf(inputDir, outputName) {
  if (!fs.existsSync(inputDir)) {
    console.log(\`⚠️  Directory not found: \${path.basename(inputDir)}, skipping PDF generation\`);
    return;
  }

  console.log(\`📄 Generating \${outputName}.pdf\`);
  
  const pdfGeneratorPath = getPdfGeneratorPath();
  const outputPath = path.join(PUBLIC_ROOT, \`\${outputName}.pdf\`);
  
  // Use the correct arguments for the PDF generator
  const cmd = \`python "\${pdfGeneratorPath}" "\${inputDir}" -o "\${outputPath}"\`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(\`   ✅ Generated \${outputName}.pdf\`);
  } catch (error) {
    console.error(\`❌ PDF generation failed for \${outputName}:\`, error.message);
    process.exit(1);
  }
}

// Main build process
try {
  // Step 1: Clean distribution directory
  console.log('\\n🧹 Cleaning distribution directory...');
  removeDirectory(PUBLIC_ROOT);
  fs.mkdirSync(PUBLIC_ROOT, { recursive: true });

  // Step 2: Generate PDFs
  console.log('\\n📚 Generating course PDFs...');
  
  // Find slides and labs directories
  const adminFiles = fs.readdirSync(ADMIN_ROOT);
  const slidesDir = adminFiles.find(f => f.includes('slides-v'));
  const labsDir = adminFiles.find(f => f.includes('labs-v'));
  
  if (slidesDir) {
    generatePdf(path.join(ADMIN_ROOT, slidesDir), '${courseName}-slides');
  }
  
  if (labsDir) {
    generatePdf(path.join(ADMIN_ROOT, labsDir), '${courseName}-labs');
  }

  // Step 3: Copy course materials
  console.log('\\n📦 Copying course materials...');
  
  const materialDirs = ['setup-test', 'solutions', 'demos'];
  materialDirs.forEach(dirName => {
    const srcDir = path.join(ADMIN_ROOT, dirName);
    const destDir = path.join(PUBLIC_ROOT, dirName);
    
    if (fs.existsSync(srcDir)) {
      copyDirectory(srcDir, destDir);
    } else {
      console.log(\`⚠️  \${dirName}/ not found, creating empty directory\`);
      fs.mkdirSync(destDir, { recursive: true });
    }
  });

  console.log('\\n✅ Build completed successfully!');
  console.log(\`📁 Output directory: \${PUBLIC_ROOT}\`);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
`;

    fs.writeFileSync(outputPath, buildContent);
    this.log(`   ✅ Created basic build.js`);
  }

  postProcessSlides(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Clean up LibreOffice HTML artifacts first
    content = this.cleanLibreOfficeArtifacts(content);

    // Clean up pandoc artifacts
    content = content.replace(/\\$/gm, '');
    content = content.replace(/^\s*\\\s*$/gm, '');

    // Fix heading levels
    content = content.replace(/^#{7,}/gm, '######');

    // Add proper spacing
    content = content.replace(/\n{3,}/g, '\n\n');

    // Fix indented code blocks - convert 4-space indented code to proper markdown code blocks
    this.fixCodeBlocks(content, filePath);
  }

  /**
   * Clean LibreOffice HTML artifacts and convert to clean markdown
   */
  cleanLibreOfficeArtifacts(content) {
    // Remove all div/span containers with classes and IDs
    content = content.replace(/:::+\s*\{[^}]*\}?\s*\n?/g, '');
    content = content.replace(/::::+\s*\{[^}]*\}?\s*\n?/g, '');
    content = content.replace(/::::::+\s*\{[^}]*\}?\s*\n?/g, '');

    // Remove standalone div closers
    content = content.replace(/^\s*:::+\s*$/gm, '');
    content = content.replace(/^\s*::::+\s*$/gm, '');
    content = content.replace(/^\s*::::::+\s*$/gm, '');

    // Remove page number references
    content = content.replace(
      /\[\[[^\]]*\]\{title="page-number"\}[^\]]*\]\{[^}]*\}/g,
      ''
    );
    content = content.replace(
      /\[\[\d+\]\{title="page-number"\}[^\]]*\]\{[^}]*\}/g,
      ''
    );

    // Extract text from square brackets with classes [text]{.class} -> **text**
    content = content.replace(/\[([^\]]+)\]\{\.text-[^}]*\}/g, '**$1**');

    // Remove empty lines with just brackets
    content = content.replace(/^\s*\[\]\{[^}]*\}\s*$/gm, '');

    // Clean up bullet points - convert styled bullets to simple markdown
    content = content.replace(
      /- \[•\]\{[^}]*\}(.*?)\[\]\{\.odfLiEnd\}/g,
      '- $1'
    );
    content = content.replace(
      /- \[--\]\{[^}]*\}(.*?)\[\]\{\.odfLiEnd\}/g,
      '  - $1'
    );

    // Clean up simple bullet markers
    content = content.replace(/- \[•\]([^[\n]*)/g, '- $1');
    content = content.replace(/- \[--\]([^[\n]*)/g, '  - $1');
    content = content.replace(/\s*\[•\]\s*/g, ' ');
    content = content.replace(/\s*\[--\]\s*/g, ' ');

    // Remove remaining odfLiEnd markers
    content = content.replace(/\[\]\{\.odfLiEnd\}/g, '');

    // Remove base64 images (they're too large and not useful in markdown)
    content = content.replace(/!\[\]\(data:image\/[^)]+\)\{[^}]*\}/g, '');

    // Remove style attributes from remaining elements
    content = content.replace(/\{style="[^"]*"\}/g, '');
    content = content.replace(/\{[^}]*style[^}]*\}/g, '');

    // Remove any remaining class attributes
    content = content.replace(/\{\.[\w-]+\}/g, '');
    content = content.replace(/\{[^}]*\.[\w-]+[^}]*\}/g, '');

    // Clean up double bold formatting
    content = content.replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '**$1**');
    content = content.replace(/\*\*([^*]+)\*\*\*\*([^*]+)\*\*/g, '**$1$2**');

    // Convert page sections to proper headings
    // Look for patterns that indicate slide titles
    const lines = content.split('\n');
    const newLines = [];
    let isFirstSlide = true;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip empty lines and artifacts
      if (
        !line.trim() ||
        line.match(/^\s*[\[\]{}:•\-\s]*$/) ||
        line.match(/^\s*<!-- -->\s*$/)
      ) {
        continue;
      }

      // Convert numbered lists that start with numbers in brackets
      line = line.replace(/^\s*(\d+)\.\s*\[\d+\.\.\]/g, '$1.');

      // Convert bold text that looks like headings to actual headings
      if (line.match(/^\*\*[^*]+\*\*\s*$/) && line.length < 80) {
        const title = line.replace(/^\*\*|\*\*$/g, '').trim();
        if (isFirstSlide) {
          newLines.push(`# ${title}`);
          isFirstSlide = false;
        } else {
          newLines.push(`## ${title}`);
        }
      } else if (
        line.trim().startsWith('**') &&
        line.trim().endsWith('**') &&
        line.length < 80 &&
        !line.includes('-')
      ) {
        const title = line.trim().replace(/^\*\*|\*\*$/g, '');
        newLines.push(`### ${title}`);
      } else {
        newLines.push(line);
      }
    }

    content = newLines.join('\n');

    // Final cleanup
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.replace(/^\s*\n+/, '');
    content = content.replace(/\n+\s*$/, '\n');

    // Clean up line breaks within bullet points
    const finalLines = content.split('\n');
    const cleanedLines = [];

    for (let i = 0; i < finalLines.length; i++) {
      let line = finalLines[i];

      // If this is a bullet point that's been split across lines, try to join it
      if (line.match(/^- \*\*[^*]*$/) && i + 1 < finalLines.length) {
        let nextLine = finalLines[i + 1];
        while (
          i + 1 < finalLines.length &&
          nextLine &&
          !nextLine.startsWith('-') &&
          !nextLine.startsWith('#')
        ) {
          line += ' ' + nextLine.trim();
          i++;
          if (i + 1 < finalLines.length) {
            nextLine = finalLines[i + 1];
          }
        }
      }

      // Fix numbered lists
      line = line.replace(
        /^(\d+)\.\*\*([^*]+):\s*([^*]*)\*\*/,
        '$1. **$2:** $3'
      );

      cleanedLines.push(line);
    }

    return cleanedLines.join('\n');
  }

  fixCodeBlocks(content, filePath) {
    const lines = content.split('\n');
    const newLines = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line starts a code block (indented with 4 spaces and looks like code)
      if (
        line.startsWith('    ') &&
        line.trim() &&
        !inCodeBlock &&
        (line.includes('(') ||
          line.includes(')') ||
          line.includes('{') ||
          line.includes('}') ||
          line.includes(';') ||
          line.includes('=') ||
          line.includes('import') ||
          line.includes('const') ||
          line.includes('function') ||
          line.includes('return'))
      ) {
        // Start a code block
        newLines.push('```javascript');
        inCodeBlock = true;

        // Add this line and look for consecutive code lines
        newLines.push(line.substring(4)); // Remove 4-space indentation

        // Look ahead for more code lines
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];

          if (nextLine.startsWith('    ') && nextLine.trim()) {
            newLines.push(nextLine.substring(4)); // Remove indentation
          } else if (!nextLine.trim()) {
            // Check if code continues after empty line
            let k = j + 1;
            while (k < lines.length && !lines[k].trim()) k++;
            if (
              k < lines.length &&
              lines[k].startsWith('    ') &&
              lines[k].trim()
            ) {
              newLines.push(''); // Add the empty line
            } else {
              break; // End of code block
            }
          } else {
            break; // End of code block
          }
          j++;
        }

        // Close the code block
        newLines.push('```');
        inCodeBlock = false;
        i = j - 1; // Set i to the last processed line
      } else {
        newLines.push(line);
      }
    }

    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent);
  }
  splitLabsIntoFiles(tempFilePath, labsDir) {
    const content = fs.readFileSync(tempFilePath, 'utf8');

    // Split content by lab headers (assuming "Lab" followed by number)
    const labSections = content.split(/(?=^##?\s*Lab\s+\d+)/m);

    labSections.forEach((section, index) => {
      if (section.trim()) {
        const labNumber = this.extractLabNumber(section) || index + 1;
        const filename = `lab${labNumber.toString().padStart(2, '0')}.md`;
        const filePath = path.join(labsDir, filename);

        // Clean up the section content
        let cleanContent = section.trim();

        // Ensure proper heading level
        if (!cleanContent.startsWith('#')) {
          cleanContent = '## ' + cleanContent;
        }

        fs.writeFileSync(filePath, cleanContent);
        this.log(`   ✅ Created ${filename}`);
      }
    });
  }

  extractLabNumber(content) {
    const match = content.match(/Lab\s+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  createTitlePage(slidesDir, courseName, version) {
    const titleContent = `# ${this.getCourseTitle()}

**Version:** ${version}  
**Date:** ${new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })}  
**Author:** Chris Minnick

**Copyright © ${new Date().getFullYear()} WatzThis, Inc.**  
All rights reserved.

**Website:** [https://www.watzthis.com](https://www.watzthis.com)
`;

    const titlePath = path.join(slidesDir, 'title-page.md');
    fs.writeFileSync(titlePath, titleContent);
    this.log(`   ✅ Created slides title-page.md`);
  }

  /**
   * Check if LibreOffice is available
   */
  checkLibreOffice() {
    try {
      // Check for LibreOffice on macOS
      execSync(
        '/Applications/LibreOffice.app/Contents/MacOS/soffice --version',
        { stdio: 'pipe' }
      );
      return true;
    } catch (error) {
      try {
        // Fallback to PATH-based libreoffice command
        execSync('libreoffice --version', { stdio: 'pipe' });
        return true;
      } catch (fallbackError) {
        return false;
      }
    }
  }

  /**
   * Convert PPTX/PPT to HTML using LibreOffice
   */
  async convertToHtmlWithLibreOffice(pptxPath, outputDir) {
    try {
      // Use LibreOffice to convert PPTX to HTML
      const command = `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to html --outdir "${outputDir}" "${pptxPath}"`;
      execSync(command, { stdio: ['pipe', 'pipe', 'pipe'] }); // Suppress stderr warnings

      // Return the HTML file path
      const baseName = path.basename(pptxPath, path.extname(pptxPath));
      return path.join(outputDir, `${baseName}.html`);
    } catch (error) {
      throw new Error(`LibreOffice conversion failed: ${error.message}`);
    }
  }
  /**
   * Convert HTML to Markdown using pandoc
   */
  async convertHtmlToMarkdown(htmlPath, markdownPath) {
    const cmd = `pandoc "${htmlPath}" -t markdown -o "${markdownPath}"`;

    try {
      execSync(cmd, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(
        `Pandoc HTML to Markdown conversion failed: ${error.message}`
      );
    }
  }

  /**
   * Fallback method for when LibreOffice is not available
   */
  async createSlidesfallback(slideFile) {
    const courseName = this.extractCourseName(slideFile);
    const version = this.extractVersion() || '1.0.0';
    const slidesDir = path.join(
      this.outputDir,
      `${courseName}-slides-v${version}`
    );

    if (!this.options.dryRun) {
      fs.mkdirSync(slidesDir, { recursive: true });

      const outputPath = path.join(
        slidesDir,
        `${courseName}-slides-v${version}.md`
      );

      this.createSlidesPlaceholder(outputPath, slideFile);
      this.createTitlePage(slidesDir, courseName, version);
    }
  }

  createSlidesPlaceholder(outputPath, originalFile) {
    const placeholderContent = `# ${this.getCourseTitle()}

## Manual Conversion Required

⚠️ **Note**: The PowerPoint file \`${originalFile}\` could not be automatically converted to markdown because pandoc does not fully support PPTX format.

### To complete the conversion:

1. **Option 1: Export to DOCX**
   - Open \`${originalFile}\` in PowerPoint
   - Go to File → Export → Change File Type → Word Document (*.docx)
   - Save as \`${originalFile.replace('.pptx', '.docx')}\`
   - Re-run the converter

2. **Option 2: Manual Export**
   - Open \`${originalFile}\` in PowerPoint
   - Copy slide content and paste into this file
   - Format according to markdown standards

3. **Option 3: Use Online Converters**
   - Use online PPTX to markdown converters
   - Review and clean up the output
   - Replace this content with the converted text

### Slide Content Structure

Follow this structure for manually converted content:

\`\`\`markdown
# Course Title

**Course Description goes here**

## Module 1: Topic Name

### Slide Title

- Bullet point 1
- Bullet point 2

### Another Slide Title

Content for the slide...

## Module 2: Next Topic

...and so on
\`\`\`

### Original File Location

\`${originalFile}\`

---

*This placeholder was generated by the course converter. Please replace with actual slide content.*
`;

    fs.writeFileSync(outputPath, placeholderContent);
    this.log(
      `   ✅ Created placeholder slides file (manual conversion required)`
    );
  }

  createLabTitlePage(labsDir, courseName, version) {
    const titleContent = `# ${this.getCourseTitle()} Labs

**Version:** ${version}  
**Date:** ${new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })}  
**Author:** Chris Minnick

**Copyright © ${new Date().getFullYear()} WatzThis, Inc.**  
All rights reserved.

**Website:** [https://www.watzthis.com](https://www.watzthis.com)
`;

    const titlePath = path.join(labsDir, 'title-page.md');
    fs.writeFileSync(titlePath, titleContent);
    this.log(`   ✅ Created labs title-page.md`);
  }

  createLabReadme(labsDir, courseName) {
    const readmeContent = `# ${this.getCourseTitle()} Labs

This directory contains all lab exercises for the ${this.getCourseTitle()} course.

## Lab Structure

Each lab is designed to be completed in sequence and builds upon previous concepts.

## Getting Started

1. Ensure you have completed the course setup requirements
2. Start with Lab 01 and proceed sequentially
3. Refer to the solutions directory if you need help

## Support

For questions or issues with these labs, please refer to the course materials or contact the instructor.
`;

    const readmePath = path.join(labsDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    this.log(`   ✅ Created labs README.md`);
  }

  generateReadme() {
    const readmeContent = `# ${this.getCourseTitle()} Admin

Private admin repository containing source materials and generation scripts for the ${this.getCourseTitle()} course.

## Structure

- \`${this.getCourseName()}-slides-v*/\` - Course presentation materials
- \`${this.getCourseName()}-labs-v*/\` - Lab exercises and instructions
- \`setup-and-outline/\` - Course description and setup requirements
- \`setup-test/\` - Setup verification files
- \`solutions/\` - Lab solution files
- \`demos/\` - Course demonstration files
- \`dist/\` - Generated course materials (created by build script)

## Building

Run the build script to generate PDFs and prepare course materials:

\`\`\`bash
npm run build
\`\`\`

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

The public course repository (without admin materials) should be: \`${this.getCourseName()}\`
`;

    const readmePath = path.join(this.outputDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    this.log(`   ✅ Created README.md`);
  }

  generateScriptsDoc() {
    const scriptsContent = `# ${this.getCourseTitle()} Build Scripts

## Overview

This repository uses a Node.js build script to generate course materials from markdown source files.

## Available Scripts

### \`npm run build\`

Runs the main build process:

1. **Clean**: Removes existing \`dist/\` directory
2. **Generate PDFs**: Creates PDF versions of slides and labs using the shared PDF generator
3. **Copy Materials**: Copies setup-test, solutions, and demos to distribution directory
4. **Package**: Prepares final course materials

## Build Process Details

### PDF Generation

The build script uses the shared PDF generator located at \`../pdf-generator/\` to create:

- **Slides PDF**: Combined presentation materials
- **Labs PDF**: All lab exercises in sequence
- **Individual Lab PDFs**: Separate PDF for each lab (optional)

### File Processing

- Automatically combines markdown files from specified directories
- Handles title pages and table of contents
- Ignores README files during PDF generation
- Preserves directory structure for supporting materials

### Output Structure

\`\`\`
dist/
├── ${this.getCourseName()}-slides.pdf
├── ${this.getCourseName()}-labs.pdf
├── setup-test/
├── solutions/
└── demos/
\`\`\`

## Customization

To modify the build process:

1. Edit \`build.js\` for custom logic
2. Update PDF generator templates in \`../pdf-generator/templates/\`
3. Modify directory mappings in the build configuration

## Dependencies

- **Node.js**: JavaScript runtime for build scripts
- **Python 3**: Required for PDF generator
- **pandoc**: Document conversion (installed via PDF generator requirements)
- **wkhtmltopdf**: PDF generation engine (installed via PDF generator requirements)

## Troubleshooting

### PDF Generation Issues

1. Check that the PDF generator is available at \`../pdf-generator/\`
2. Ensure Python dependencies are installed: \`pip install -r ../pdf-generator/requirements-pdf.txt\`
3. Verify pandoc installation: \`pandoc --version\`

### Build Script Issues

1. Check Node.js version compatibility
2. Verify all source directories exist
3. Review build.js console output for specific errors

## Manual PDF Generation

You can also generate PDFs manually using the PDF generator directly:

\`\`\`bash
python ../pdf-generator/scripts/generate_pdf.py \\
  --input-dir "${this.getCourseName()}-slides-v*/" \\
  --output-file "dist/${this.getCourseName()}-slides.pdf" \\
  --title "${this.getCourseTitle()} Slides"
\`\`\`
`;

    const scriptsPath = path.join(this.outputDir, 'SCRIPTS.md');
    fs.writeFileSync(scriptsPath, scriptsContent);
    this.log(`   ✅ Created SCRIPTS.md`);
  }

  generateSetupOutline() {
    // Generate course description
    const courseDescContent = `# ${this.getCourseTitle()}

## Course Description

${this.getCourseTitle()} is a comprehensive course designed to teach advanced concepts and practical skills.

## Learning Objectives

By the end of this course, students will be able to:

- Understand core concepts and principles
- Apply best practices in real-world scenarios
- Build and deploy production-ready applications
- Troubleshoot and debug complex issues

## Prerequisites

- Basic programming knowledge
- Familiarity with development tools
- Understanding of fundamental concepts

## Course Outline

### Module 1: Introduction
- Course overview
- Environment setup
- Basic concepts

### Module 2: Core Concepts
- Fundamental principles
- Key terminology
- Best practices

### Module 3: Practical Application
- Hands-on exercises
- Real-world examples
- Project work

### Module 4: Advanced Topics
- Complex scenarios
- Performance optimization
- Production deployment

## Assessment

- Lab exercises (70%)
- Final project (30%)

## Resources

- Course repository
- Official documentation
- Community resources

## Duration

3 days (24 hours total)

## Target Audience

Developers with intermediate experience looking to advance their skills.
`;

    const descPath = path.join(
      this.outputDir,
      'setup-and-outline',
      'course-description-and-outline.md'
    );
    fs.writeFileSync(descPath, courseDescContent);
    this.log(`   ✅ Created course-description-and-outline.md`);

    // Generate setup guide
    const setupContent = `# ${this.getCourseTitle()} Setup Guide

## Development Environment Requirements

### Required Software

1. **Code Editor**
   - Visual Studio Code (recommended)
   - Alternative: WebStorm, Atom, or Sublime Text

2. **Runtime Environment**
   - Node.js (LTS version)
   - npm or yarn package manager

3. **Version Control**
   - Git
   - GitHub account (for course repository access)

4. **Browser**
   - Chrome or Firefox (with developer tools)

### Recommended Extensions (VS Code)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

## Course Repository Setup

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/chrisminnick/${this.getCourseName()}.git
   cd ${this.getCourseName()}
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Verify Setup**
   \`\`\`bash
   npm test
   \`\`\`

## Environment Verification

Run the setup test to ensure your environment is properly configured:

\`\`\`bash
cd setup-test
npm install
npm start
\`\`\`

You should see a success message indicating your environment is ready.

## Troubleshooting

### Common Issues

1. **Node.js Version**
   - Ensure you're using Node.js LTS version
   - Use nvm to manage Node.js versions if needed

2. **Permission Issues**
   - Avoid using \`sudo\` with npm
   - Configure npm properly for global packages

3. **Port Conflicts**
   - Default development server runs on port 3000
   - Change port if needed: \`PORT=3001 npm start\`

### Getting Help

- Check the course repository issues
- Ask questions during class
- Refer to official documentation

## Pre-Course Checklist

- [ ] Code editor installed and configured
- [ ] Node.js and npm installed
- [ ] Git configured with your GitHub account
- [ ] Course repository cloned and setup verified
- [ ] Browser developer tools accessible
- [ ] All required software tested and working

## Course Materials Access

- **Repository**: https://github.com/chrisminnick/${this.getCourseName()}
- **Slides**: Available in course repository
- **Labs**: Individual exercises in labs directory
- **Solutions**: Reference implementations (use responsibly)

## Additional Resources

- Official documentation links
- Community forums and discussion groups
- Recommended reading and tutorials
- Tool-specific guides and references
`;

    const setupPath = path.join(
      this.outputDir,
      'setup-and-outline',
      'setup-guide.md'
    );
    fs.writeFileSync(setupPath, setupContent);
    this.log(`   ✅ Created setup-guide.md`);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src);

    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node convert-course.js <source-course-dir> <output-course-name> [options]

Arguments:
  source-course-dir    Path to directory containing .pptx and .docx files
  output-course-name   Name for the output course directory (e.g., 'advanced-react-admin')

Options:
  --verbose           Show detailed output
  --dry-run          Show what would be done without making changes

Examples:
  node convert-course.js ../advanced-react advanced-react-admin
  node convert-course.js ../my-course my-course-admin --verbose
  node convert-course.js ../test-course test-course-admin --dry-run
`);
    process.exit(1);
  }

  const sourceDir = args[0];
  const outputName = args[1];
  const options = {
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
  };

  const converter = new CourseConverter(sourceDir, outputName, options);
  converter.convert();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { CourseConverter };
