#!/usr/bin/env node

/**
 * Test script for course converter
 * Validates the converter setup and basic functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Course Converter Test Suite');
console.log('===============================');

let passed = 0;
let failed = 0;

function test(name, testFn) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    testFn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Check Node.js version
test('Node.js version compatibility', () => {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion < 14) {
    throw new Error(`Node.js 14+ required, found ${nodeVersion}`);
  }
  console.log(`   Node.js ${nodeVersion} ✓`);
});

// Test 2: Check pandoc availability
test('pandoc installation', () => {
  try {
    const pandocVersion = execSync('pandoc --version', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const versionLine = pandocVersion.split('\n')[0];
    console.log(`   ${versionLine} ✓`);
  } catch (error) {
    throw new Error('pandoc not found. Install with: brew install pandoc');
  }
});

// Test 3: Check converter script exists
test('converter script exists', () => {
  const converterPath = path.join(__dirname, 'convert-course.js');
  if (!fs.existsSync(converterPath)) {
    throw new Error('convert-course.js not found');
  }
  console.log(`   convert-course.js found ✓`);
});

// Test 4: Check template directory exists
test('template directory exists', () => {
  const templatePath = path.resolve(
    __dirname,
    '..',
    'modern-frontend-web-dev-admin'
  );
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      'Template directory not found: modern-frontend-web-dev-admin'
    );
  }
  console.log(`   Template directory found ✓`);
});

// Test 5: Check converter can be imported
test('converter module imports', () => {
  const { CourseConverter } = require('./convert-course.js');
  if (typeof CourseConverter !== 'function') {
    throw new Error('CourseConverter class not exported properly');
  }
  console.log(`   CourseConverter class available ✓`);
});

// Test 6: Dry run with example (if advanced-react exists)
test('dry run with advanced-react (if available)', () => {
  const advancedReactPath = path.resolve(__dirname, '..', 'advanced-react');
  if (fs.existsSync(advancedReactPath)) {
    const { CourseConverter } = require('./convert-course.js');
    const converter = new CourseConverter(
      advancedReactPath,
      'test-advanced-react-admin',
      { dryRun: true, verbose: false }
    );

    // This should not throw if validation passes
    converter.validateSource();
    console.log(`   Dry run validation passed ✓`);
  } else {
    console.log(`   Skipped (advanced-react directory not found)`);
  }
});

// Test 7: Check file permissions
test('file system permissions', () => {
  const testDir = path.join(__dirname, 'test-permissions');
  try {
    fs.mkdirSync(testDir);
    fs.writeFileSync(path.join(testDir, 'test.txt'), 'test');
    fs.rmSync(testDir, { recursive: true });
    console.log(`   Write permissions OK ✓`);
  } catch (error) {
    throw new Error('Insufficient file system permissions');
  }
});

// Test 8: Check package.json validity
test('package.json validity', () => {
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json not found');
  }

  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (!packageData.name || !packageData.version) {
      throw new Error('Invalid package.json structure');
    }
    console.log(
      `   package.json valid (${packageData.name} v${packageData.version}) ✓`
    );
  } catch (error) {
    throw new Error(`Invalid package.json: ${error.message}`);
  }
});

// Summary
console.log('\n📊 Test Results');
console.log('================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! The converter is ready to use.');
  console.log('\nTo convert a course, run:');
  console.log('  node convert-course.js <source-dir> <output-name>');
  console.log('\nExample:');
  console.log(
    '  node convert-course.js ../advanced-react advanced-react-admin'
  );
} else {
  console.log(
    '\n⚠️  Some tests failed. Please fix the issues before using the converter.'
  );
  process.exit(1);
}
