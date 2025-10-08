# Rspack Configuration Tests

This directory contains unit tests for the Rspack build configuration.

## Overview

The `rspack.config.test.js` file provides comprehensive validation for the `rspack.config.js` configuration file, ensuring:

- Configuration structure integrity
- SWC loader setup with TypeScript parsing (TINY-12824)
- JSC parser configuration with ES2022 target
- Module resolution and aliasing
- Development server configuration
- Optimization settings
- Source map generation
- Entry point validation

## Running the Tests

### Option 1: Using Mocha directly

```bash
# From the repository root
npx mocha modules/tinymce/test/config/rspack.config.test.js

# From the tinymce module directory
cd modules/tinymce
npx mocha test/config/rspack.config.test.js
```

### Option 2: Using npm/yarn

Add a script to `modules/tinymce/package.json`:

```json
{
  "scripts": {
    "test:config": "mocha test/config/*.test.js"
  }
}
```

Then run:

```bash
cd modules/tinymce
yarn test:config
```

### Option 3: Include in existing test suite

Integrate with the existing Grunt test configuration by adding the config tests to the test pipeline.

## Test Coverage

The test suite covers:

### Configuration Structure (7 tests)
- Array export validation
- Configuration object structure
- Mode, devtool, and target settings

### Module Rules (4 tests)
- TypeScript file handling
- Loader configuration
- string-replace-loader setup
- builtin:swc-loader setup

### SWC Loader Configuration - TINY-12824 (5 tests)
- JSC configuration object presence
- TypeScript parser syntax validation
- ES2022 target setting
- Source map enablement
- Required properties validation

### Resolve Configuration (3 tests)
- Extension resolution (.ts, .js)
- TypeScript config file resolution
- Module aliases

### Output Configuration (1 test)
- Output path and filename pattern validation

### Optimization Configuration (1 test)
- Development optimization settings

### Dev Server Configuration (4 tests)
- Port and host configuration
- Hot reload and live reload settings
- Static file serving
- Middleware setup

### Watch Options (1 test)
- node_modules exclusion

### Plugins Configuration (1 test)
- TsCheckerRspackPlugin presence

### JavaScript File Rules (2 tests)
- Source map handling
- Module resolution

### Asset Rules (2 tests)
- SVG file handling
- Raw query parameter handling

### Entry Points (4 tests)
- Core demo entry validation
- Main tinymce entry validation
- Plugin entries validation
- Theme entries validation

### Infrastructure Logging (1 test)
- Logging level configuration

### Ignored Warnings (1 test)
- Warning pattern configuration

### Statistics Configuration (1 test)
- Stats output settings

### TypeScript Compilation Target Validation (2 tests)
- Modern ES target validation
- Target consistency across configs

### Parser Syntax Validation (2 tests)
- TypeScript syntax configuration
- Parser option conflict detection

### Edge Cases and Error Handling (3 tests)
- Required properties validation
- File path validation
- Regex pattern validation

### Configuration Context (1 test)
- Context path validation

### Total: 50+ comprehensive tests

## Key Features

### TINY-12824 Specific Tests

The change introduced in TINY-12824 adds JSC parser configuration to the SWC loader. The tests specifically validate:

1. **JSC Object Presence**: Ensures the `jsc` configuration object exists
2. **Parser Syntax**: Validates `parser.syntax` is set to `'typescript'`
3. **Target Setting**: Confirms `target` is set to `'es2022'`
4. **Source Maps**: Verifies source maps remain enabled
5. **Configuration Completeness**: Checks all required properties are present

### Best Practices

- Uses Chai assertions for clear, readable test expectations
- Descriptive test names following the pattern: "should [expected behavior]"
- Organized into logical describe blocks by concern
- Comprehensive edge case and error handling coverage
- Validates both structure and values

## Dependencies

- **Chai**: Assertion library (available in project)
- **Mocha**: Test runner (available in project via Bedrock)
- **Node.js**: Runtime environment

## Maintenance

When updating `rspack.config.js`:

1. Run these tests to ensure no regressions
2. Add new tests for any new configuration options
3. Update existing tests if configuration structure changes
4. Ensure all tests pass before merging changes

## Troubleshooting

### Module Resolution Errors

If you encounter module resolution errors:

```bash
# Ensure you're in the correct directory
cd modules/tinymce

# Install dependencies if needed
yarn install
```

### Path Resolution Issues

The tests use `path.resolve(__dirname, '../../rspack.config.js')` to locate the config file. If this fails:

- Verify the test file is in `modules/tinymce/test/config/`
- Verify `rspack.config.js` is in `modules/tinymce/`

### Chai Not Found

If Chai is not found:

```bash
# From repository root
yarn install

# Chai should be available as it's in the root package.json devDependencies
```

## Future Enhancements

Potential improvements for these tests:

1. Add integration tests that actually run Rspack with the config
2. Validate output bundle sizes and structure
3. Test hot module replacement functionality
4. Validate TypeScript compilation output
5. Test error handling for malformed configurations
6. Add performance benchmarks for build times

## Related Files

- `../../rspack.config.js` - The configuration file being tested
- `../../package.json` - Module dependencies and scripts
- `../../tsconfig.json` - TypeScript configuration
- `../../Gruntfile.js` - Grunt build configuration