import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

// Linting is split in two: oxlint enforces the bulk of the shared preset, and ESLint runs the
// handful of rules oxlint cannot reproduce (see eslint.config.ts). Every lint entrypoint goes
// through here so the two stay in step. Module resolution locates the binaries whether they are
// hoisted to the premium root or installed in a standalone tinymce checkout.
const require = createRequire(import.meta.url);
const binOf = (pkg, bin) => join(dirname(require.resolve(`${pkg}/package.json`)), bin);

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('usage: node bin/lint.mjs <path>...');
  process.exit(1);
}

// ESLint only ever linted TypeScript here, so keep oxlint off the generated and vendored
// JavaScript that sits alongside it.
const oxlintArgs = [ '--max-warnings=0', ...[ 'js', 'jsx', 'cjs', 'mjs' ].map((ext) => `--ignore-pattern=*.${ext}`), ...targets ];
// Most modules have no .tsx at all, so an unmatched pattern is expected rather than an error.
const eslintArgs = [ '--max-warnings=0', '--no-error-on-unmatched-pattern', ...targets.flatMap((target) => [ `${target}/**/*.ts`, `${target}/**/*.tsx` ]) ];

const run = (bin, args) => new Promise((resolve) => {
  spawn(process.execPath, [ bin, ...args ], { stdio: 'inherit' }).on('close', (code) => resolve(code ?? 1));
});

const codes = await Promise.all([
  run(binOf('oxlint', 'bin/oxlint'), oxlintArgs),
  run(binOf('eslint', 'bin/eslint.js'), eslintArgs)
]);

process.exit(codes.some((code) => code !== 0) ? 1 : 0);
