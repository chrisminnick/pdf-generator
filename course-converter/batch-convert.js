#!/usr/bin/env node

/**
 * Batch Course Converter
 * Converts multiple courses at once based on configuration
 */

const fs = require('fs');
const path = require('path');
const { CourseConverter } = require('./convert-course.js');

// Configuration for batch conversion
const BATCH_CONFIG = {
  // Example configurations - customize as needed
  courses: [
    {
      source: '../advanced-react',
      output: 'advanced-react-admin',
      enabled: true,
    },
    // Add more courses here as needed
    // {
    //   source: '../another-course',
    //   output: 'another-course-admin',
    //   enabled: false
    // }
  ],
  options: {
    verbose: false,
    dryRun: false,
    continueOnError: true,
  },
};

class BatchConverter {
  constructor(config) {
    this.config = config;
    this.results = [];
  }

  async convertAll() {
    console.log('🚀 Batch Course Converter');
    console.log('=========================');

    const enabledCourses = this.config.courses.filter(
      (course) => course.enabled
    );

    if (enabledCourses.length === 0) {
      console.log('⚠️  No courses enabled for conversion');
      return;
    }

    console.log(`📋 Found ${enabledCourses.length} course(s) to convert:`);
    enabledCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.source} → ${course.output}`);
    });

    if (this.config.options.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No files will be modified');
    }

    console.log('\n🔄 Starting conversions...\n');

    for (const [index, course] of enabledCourses.entries()) {
      console.log(
        `\n📚 [${index + 1}/${enabledCourses.length}] Converting: ${
          course.source
        }`
      );
      console.log('━'.repeat(60));

      try {
        const converter = new CourseConverter(
          course.source,
          course.output,
          this.config.options
        );

        await converter.convert();

        this.results.push({
          course: course.output,
          status: 'success',
          error: null,
        });
      } catch (error) {
        console.error(
          `❌ Failed to convert ${course.source}: ${error.message}`
        );

        this.results.push({
          course: course.output,
          status: 'failed',
          error: error.message,
        });

        if (!this.config.options.continueOnError) {
          console.log('⚠️  Stopping batch conversion due to error');
          break;
        }
      }
    }

    this.showSummary();
  }

  showSummary() {
    console.log('\n📊 Batch Conversion Summary');
    console.log('════════════════════════════');

    const successful = this.results.filter((r) => r.status === 'success');
    const failed = this.results.filter((r) => r.status === 'failed');

    console.log(`✅ Successful: ${successful.length}`);
    successful.forEach((result) => {
      console.log(`   ✓ ${result.course}`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}`);
      failed.forEach((result) => {
        console.log(`   ✗ ${result.course}: ${result.error}`);
      });
    }

    console.log(`\n📈 Total: ${this.results.length} course(s) processed`);

    if (successful.length > 0 && !this.config.options.dryRun) {
      console.log('\n🎉 Conversion completed! Next steps:');
      console.log('   1. Review the generated course directories');
      console.log('   2. Edit the markdown files as needed');
      console.log(
        '   3. Test the build process: cd <course-dir> && npm run build'
      );
      console.log('   4. Add to version control');
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);

  // Parse command line options
  const options = {
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
    continueOnError: !args.includes('--stop-on-error'),
  };

  // Check for config file
  const configFile = args.find((arg) => arg.startsWith('--config='));
  let config = BATCH_CONFIG;

  if (configFile) {
    const configPath = configFile.split('=')[1];
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`📄 Using config file: ${configPath}`);
      } catch (error) {
        console.error(`❌ Invalid config file: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ Config file not found: ${configPath}`);
      process.exit(1);
    }
  }

  // Override options from command line
  config.options = { ...config.options, ...options };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Batch Course Converter

Usage: node batch-convert.js [options]

Options:
  --verbose            Show detailed output
  --dry-run           Show what would be done without making changes
  --stop-on-error     Stop conversion on first error (default: continue)
  --config=<file>     Use custom configuration file
  --help, -h          Show this help message

Configuration:
  Edit the BATCH_CONFIG object in this file or provide a JSON config file.
  
  Example config.json:
  {
    "courses": [
      {
        "source": "../course1",
        "output": "course1-admin", 
        "enabled": true
      }
    ],
    "options": {
      "verbose": false,
      "dryRun": false,
      "continueOnError": true
    }
  }

Examples:
  node batch-convert.js
  node batch-convert.js --verbose --dry-run
  node batch-convert.js --config=my-config.json
`);
    return;
  }

  // Validate enabled courses
  const enabledCourses = config.courses.filter((course) => course.enabled);

  if (enabledCourses.length === 0) {
    console.log('⚠️  No courses enabled in configuration');
    console.log(
      '   Edit BATCH_CONFIG in batch-convert.js or provide a config file'
    );
    return;
  }

  // Start batch conversion
  const batchConverter = new BatchConverter(config);
  batchConverter.convertAll().catch((error) => {
    console.error('❌ Batch conversion failed:', error.message);
    process.exit(1);
  });
}

// Create example config file
function createExampleConfig() {
  const exampleConfig = {
    courses: [
      {
        source: '../advanced-react',
        output: 'advanced-react-admin',
        enabled: true,
      },
      {
        source: '../another-course',
        output: 'another-course-admin',
        enabled: false,
      },
    ],
    options: {
      verbose: false,
      dryRun: false,
      continueOnError: true,
    },
  };

  const configPath = path.join(__dirname, 'example-config.json');
  fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2));
  console.log(`📄 Created example-config.json`);
}

// Create example config if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'example-config.json'))) {
  createExampleConfig();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BatchConverter };
