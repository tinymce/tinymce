#!/usr/bin/env node
/* eslint-disable no-console */

// ============================================================================
// OVERVIEW:
//   This script provides a preview of suggested version updates for library
//   packages, then runs lerna version which automatically generates changelogs
//   via the version lifecycle hook.
//
// PREREQUISITES:
//   - changie (changelog management): https://changie.dev
//   - lerna (monorepo management): https://lerna.js.org
//   - zx: npm install -g zx
//
// TYPICAL WORKFLOWS:
//   Interactive:  ./release-libs.mts
//   Dry run:      ./release-libs.mts --dry-run
// ============================================================================

import { $, argv, chalk, echo, fs, path, YAML, question, cd, glob } from 'zx';

// ============================================================================
// Type Definitions
// ============================================================================

interface PackageData {
  name: string;              // Full scoped package name (e.g., @ephox/katamari)
  currentVersion: string;    // Current semantic version
  nextVersion: string;       // Suggested next version
  changeCount: number;       // Number of change fragments
  hasChanges: boolean;       // Whether package has unreleased changes
}

interface ChangeSummary {
  kinds: string;   // Comma-separated change kinds (e.g., 'Added, Fixed')
  issues: string;  // Comma-separated issue numbers (e.g., '#123, #456')
}

interface ChangeFragment {
  kind: string;     // Type of change (Added, Changed, Deprecated, Removed, Fixed, Security)
  body?: string;    // Description of the change
  Issue?: number;   // Related issue number
}

interface OutputHelpers {
  error: (msg: string) => void;
  success: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
  separator: (char?: string, color?: string) => void;
}

interface LernaPackage {
  name: string;       // Full scoped package name (e.g., @ephox/katamari)
  version: string;    // Current version
  private: boolean;   // Whether package is private
  location: string;   // Absolute path to package
}

// Enable verbose mode for debugging (set to false for production)
$.verbose = false;

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const CHANGES_DIR = path.join(PROJECT_ROOT, '.changes/unreleased');

// Packages excluded from lerna entirely (different release process)
const EXCLUDED_PACKAGES = [ 'tinymce', 'oxide-components' ];

// Parse command line flags
const DRY_RUN = argv['dry-run'] || argv.n || false;
const SHOW_HELP = argv.help || argv.h || false;

// ============================================================================
// Helper Functions - Output Formatting
// ============================================================================

const output: OutputHelpers = {
  error: (msg: string) => console.error(chalk.red(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  warning: (msg: string) => console.log(chalk.yellow(msg)),
  info: (msg: string) => console.log(chalk.blue(msg)),
  separator: (char = '━', color = 'blue') => {
    const line = char.repeat(64);
    console.log((chalk as Record<string, any>)[color](line));
  }
};

// ============================================================================
// Helper Functions - Package Operations
// ============================================================================

const isExcluded = (packageName: string): boolean =>
  EXCLUDED_PACKAGES.some((excluded) => packageName.startsWith(excluded));

/**
 * Extract unscoped package name
 * Example: @ephox/katamari -> katamari
 */
const extractPackageName = (scopedName: string): string =>
  scopedName.replace(/@[^/]*\//, '');

/**
 * Get all packages from lerna
 * Returns Map of package name to full lerna package data for efficient lookups
 */
const getAllPackages = async (): Promise<Map<string, LernaPackage>> => {
  try {
    const result = await $({ quiet: true })`npx lerna list --json --loglevel=error`;
    const lernaPackages: LernaPackage[] = JSON.parse(result.stdout);

    const packageMap = new Map(
      lernaPackages
        .filter((pkg) => !isExcluded(extractPackageName(pkg.name)))
        .map((pkg) => [ pkg.name, pkg ])
    );

    return packageMap;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.error(`Error: Failed to run 'npx lerna list': ${message}`);
    process.exit(1);
  }
};

const getCurrentVersion = (lernaPackage: LernaPackage): string => lernaPackage.version;

const hasChanges = async (packageName: string): Promise<boolean> => {
  try {
    const files = await glob(`${CHANGES_DIR}/${packageName}-*.yaml`);
    return files.length > 0;
  } catch (_error) {
    return false;
  }
};

const getNextVersion = async (packageName: string): Promise<string> => {
  try {
    const result = await $({
      quiet: true,
      cwd: PROJECT_ROOT
    })`changie next auto --project ${packageName}`;

    // Clean up changie output (remove % and package name prefix)
    const version = result.stdout
      .trim()
      .replace(/%/g, '')
      .replace(packageName, '')
      .trim();

    return version || 'error';
  } catch (_error) {
    return 'error';
  }
};

/**
 * Calculate next patch version by incrementing patch number
 */
const getNextPatchVersion = (currentVersion: string): string => {
  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return 'error';
  }

  const [ , major, minor, patch ] = match;
  const nextPatch = parseInt(patch, 10) + 1;
  return `${major}.${minor}.${nextPatch}`;
};

const countChanges = async (packageName: string): Promise<number> => {
  try {
    const files = await glob(`${CHANGES_DIR}/${packageName}-*.yaml`);
    return files.length;
  } catch (_error) {
    return 0;
  }
};

const getChangeSummary = async (packageName: string): Promise<ChangeSummary> => {
  const kinds: string[] = [];
  const issues: string[] = [];

  try {
    const changeFiles = await glob(`${CHANGES_DIR}/${packageName}-*.yaml`);

    for (const filePath of changeFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = YAML.parse(content) as ChangeFragment;

      if (data.kind) {
        kinds.push(data.kind);
      }

      const issueMatch = content.match(/Issue:\s*(\d+)/);
      if (issueMatch) {
        issues.push(`#${issueMatch[1]}`);
      }
    }
  } catch (_error) {
  }

  return { kinds: kinds.join(', '), issues: issues.join(', ') };
};

// ============================================================================
// Prerequisite Checks
// ============================================================================

const checkPrerequisites = async (): Promise<void> => {
  const missing: string[] = [];

  const tools: Record<string, string> = {
    changie: 'changie: https://changie.dev/guide/installation/',
    npx: 'Node.js/npx: https://nodejs.org/'
  };

  for (const [ tool, install ] of Object.entries(tools)) {
    try {
      await $({ quiet: true })`command -v ${tool}`;
    } catch {
      missing.push(install);
    }
  }

  if (missing.length > 0) {
    output.error('Error: Missing required tools\n');
    echo('Please install:');
    missing.forEach((msg) => echo(`  - ${msg}`));
    process.exit(1);
  }

  const changieConfig = path.join(PROJECT_ROOT, '.changie.yaml');
  if (!await fs.pathExists(changieConfig)) {
    output.error('Error: .changie.yaml not found in project root');
    output.warning('Changie needs to be configured before running this script.');
    process.exit(1);
  }

  const hookScript = path.join(PROJECT_ROOT, 'scripts', 'lerna-changie-hook.sh');
  if (!await fs.pathExists(hookScript)) {
    output.error(`Error: Lerna changelog hook not found: ${hookScript}`);
    process.exit(1);
  }

  try {
    await fs.access(hookScript, fs.constants.X_OK);
  } catch {
    output.error(`Error: Lerna changelog hook is not executable: ${hookScript}`);
    output.warning(`Run: chmod +x ${hookScript}`);
    process.exit(1);
  }

  const packageJson = await fs.readJson(path.join(PROJECT_ROOT, 'package.json'));
  if (!packageJson.scripts?.version?.includes('lerna-changie-hook.sh')) {
    output.error('Error: package.json is missing the version lifecycle script');
    output.warning('Add this to the scripts section of package.json:');
    output.info('    "version": "./scripts/lerna-changie-hook.sh"');
    process.exit(1);
  }
};

// ============================================================================
// Display Functions
// ============================================================================

const showUsage = (): void => {
  echo(`
${chalk.bold('Usage:')} ${path.basename(import.meta.url)} [OPTIONS]

Preview version updates and run lerna version with automatic changelog generation.

${chalk.bold('OPTIONS:')}
    -h, --help              Show this help message
    -n, --dry-run           Preview what would happen without making changes

${chalk.bold('EXAMPLES:')}
    # Interactive version update with changelog generation (typical workflow)
    ./release-libs.mts

    # Preview without making changes
    ./release-libs.mts --dry-run

${chalk.bold('NOTE:')}
    Changelogs are automatically generated and merged during lerna version
    via the version lifecycle hook. No separate merge step is needed.
`);
};

const displayPackageTable = (
  packages: string[],
  versions: string[],
  nextVersions: string[],
  changeCounts: number[]
): void => {
  output.info('┌──────────────────────────────┬──────────────┬──────────────┬──────────┐');
  output.info('│ Package                      │ Current Ver  │ Suggested    │ Changes  │');
  output.info('├──────────────────────────────┼──────────────┼──────────────┼──────────┤');

  packages.forEach((pkg, i) => {
    const line = `│ ${pkg.padEnd(28)} │ ${versions[i].padEnd(12)} │ ${nextVersions[i].padEnd(12)} │ ${String(changeCounts[i]).padEnd(8)} │`;
    output.info(line);
  });

  output.info('└──────────────────────────────┴──────────────┴──────────────┴──────────┘');
};

// ============================================================================
// Main Function
// ============================================================================

const main = async (): Promise<void> => {
  if (SHOW_HELP) {
    showUsage();
    process.exit(0);
  }

  cd(PROJECT_ROOT);

  await checkPrerequisites();

  output.success('╔════════════════════════════════════════════════════════════════╗');
  output.success('║  Library Release Automation                                   ║');
  output.success('╚════════════════════════════════════════════════════════════════╝');
  echo('');

  if (DRY_RUN) {
    output.warning('🔍 DRY-RUN MODE: Previewing changes only');
    echo('');
  }

  output.info('📦 Scanning packages from lerna...');
  const packagesMap = await getAllPackages();

  if (packagesMap.size === 0) {
    output.warning('No packages found.');
    process.exit(0);
  }

  output.success(`Found ${packagesMap.size} package(s):`);
  echo('');

  const packageData: PackageData[] = await Promise.all(
    Array.from(packagesMap.values()).map(async (lernaPackage) => {
      const packageName = extractPackageName(lernaPackage.name);
      const currentVersion = getCurrentVersion(lernaPackage);
      const changeCount = await countChanges(packageName);
      const pkgHasChanges = await hasChanges(packageName);

      let nextVersion: string;
      if (pkgHasChanges) {
        nextVersion = await getNextVersion(packageName);
      } else {
        nextVersion = getNextPatchVersion(currentVersion);
      }

      return {
        name: lernaPackage.name,
        currentVersion,
        nextVersion,
        changeCount,
        hasChanges: pkgHasChanges
      };
    })
  );

  displayPackageTable(
    packageData.map((p) => p.name),
    packageData.map((p) => p.currentVersion),
    packageData.map((p) => p.nextVersion),
    packageData.map((p) => p.changeCount)
  );
  echo('');

  output.info('Change Summary:');
  for (const data of packageData) {
    const packageName = extractPackageName(data.name);
    const { kinds, issues } = await getChangeSummary(packageName);

    if (kinds) {
      output.success(`  ${data.name}: ${kinds}`);
      if (issues) {
        echo(`    Issues: ${issues}`);
      }
    } else {
      output.success(`  ${data.name}: No changes (will use patch bump)`);
    }
  }
  echo('');

  output.warning('Note: Suggested versions are from changie. You\'ll be prompted by lerna to select actual versions.');
  echo('');

  if (DRY_RUN) {
    output.warning('Dry-run complete. Run without --dry-run to proceed.');
    process.exit(0);
  }

  output.separator('━', 'yellow');
  output.warning('Ready to run lerna version');
  output.separator('━', 'yellow');
  echo('');
  output.info('Lerna will:');
  echo('  1. Prompt you to select versions for each package');
  echo('  2. Update all package.json files and interdependencies');
  output.success('  3. Automatically generate changelogs (via version lifecycle hook)');
  output.success('  4. Merge changelogs into CHANGELOG.md files');
  echo('  5. Create a git commit with all changes');
  echo('  6. Create git tags for each package');
  echo('');
  output.info('Use the suggested versions above as guidance.');
  output.info('You can cancel at any time by pressing Ctrl+C.');
  echo('');

  const answer = await question('Continue? (y/n) ');
  echo('');

  if (!answer.toLowerCase().match(/^y(es)?$/)) {
    output.warning('Cancelled by user.');
    process.exit(0);
  }

  echo('');
  output.separator('━', 'green');
  output.success('Running lerna version');
  output.separator('━', 'green');
  echo('');

  try {
    await $({ stdio: 'inherit' })`npx lerna version --no-push`;
  } catch (_error) {
    echo('');
    output.separator('━', 'red');
    output.error('Error: lerna version failed or was cancelled');
    output.separator('━', 'red');
    echo('');
    output.warning('Operation cancelled. Check \'git status\' to see if any changes were made.');
    output.warning('To undo: git reset --hard HEAD~1 && git tag -d <tags>');
    process.exit(1);
  }

  echo('');
  output.success('╔════════════════════════════════════════════════════════════════╗');
  output.success('║  Summary                                                       ║');
  output.success('╚════════════════════════════════════════════════════════════════╝');
  echo('');
  output.success(`✓ Release completed successfully`);
  output.success(`  ${packageData.length} package(s) released`);
  echo(`
${chalk.blue('What was done:')}
  ✓ Lerna updated package.json versions and interdependencies
  ✓ Changelogs generated from change fragments
  ✓ Changelogs merged into CHANGELOG.md files
  ✓ Git commit created with all changes
  ✓ Git tags created for each package

${chalk.blue('Next steps:')}
  ${chalk.yellow('1. Review the changes: git show HEAD')}
  2. Build and test to verify everything works
  ${chalk.yellow('3. Push changes: git push --follow-tags')}

${chalk.blue('If you need to undo (before pushing):')}
  # Remove the commit but keep changes in working directory:
  ${chalk.yellow('git reset --soft HEAD~1')}

  # Remove the commit AND discard all changes:
  ${chalk.yellow('git reset --hard HEAD~1')}

  # Reset all local tags to match remote (removes local-only tags):
  ${chalk.yellow('git tag -l | xargs git tag -d && git fetch --tags')}

  # Or delete specific package tags:
  ${chalk.yellow('git tag -l | grep -E \\\'@(ephox|tinymce)/\\\' | xargs git tag -d')}

  # Or delete individual tags:
  ${chalk.yellow('git tag -d @ephox/katamari@1.2.3 @ephox/agar@2.3.4')}
`);
};

// ============================================================================
// Entry Point
// ============================================================================

main().catch((error: Error) => {
  output.error(`\nFatal error: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
