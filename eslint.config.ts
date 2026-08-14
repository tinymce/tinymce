import tinyPlugin from '@tinymce/eslint-plugin';
import { type Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import onlyWarn from 'eslint-plugin-only-warn';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/*
 * Oxlint (.oxlintrc.json) enforces the bulk of `tinyPlugin.configs.editor`. ESLint runs only
 * the rules below, which oxlint either does not implement or implements with different
 * results to typescript-eslint; every other preset rule is switched off here so that nothing
 * is linted twice. None of these need type information, which is why this pass no longer
 * enables the TypeScript project service.
 */
const residualRules = [
  // No oxlint implementation.
  'consistent-this',
  'id-blacklist',
  'max-len',
  'no-undef-init',
  '@typescript-eslint/naming-convention',
  // Oxlint will not implement this; it defers to oxfmt's import sorting.
  'import-x/order',
  // Oxlint reports `console` member access even when `console` is a local binding.
  'no-console',
  // Oxlint ignores the `/* eslint rule: 0 */` severity-comment form.
  'no-nested-ternary',
  // Oxlint flags literal type annotations that typescript-eslint deliberately allows.
  '@typescript-eslint/no-inferrable-types'
];

const presetRules = tinyPlugin.configs.editor.reduce<Linter.RulesRecord>(
  (acc, config) => ({ ...acc, ...config.rules }), {}
);

const migratedToOxlint = Object.fromEntries(
  Object.keys(presetRules).filter((name) => !residualRules.includes(name)).map((name) => [ name, 'off' ])
);

export default defineConfig(
  [
    ...tinyPlugin.configs.editor,
    {
      linterOptions: {
        // The directives left in the source are consumed by oxlint, not by ESLint.
        reportUnusedDisableDirectives: 'off'
      },
      plugins: {
        onlyWarn,
      },
      rules: {
        ...migratedToOxlint,
        'max-len': [ 'warn', 260 ],
      },
    },
    {
      files: [ 'modules/agar-sw/**/*.ts' ],
      rules: {
        'consistent-this': 'off'
      }
    },
    {
      files: [ 'modules/oxide-components/**/*.{ts,tsx}' ],
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      rules: {
        // Oxlint enforces these; they are registered here only so that the `react-hooks/*`
        // disable directives in the source still resolve.
        ...Object.fromEntries(Object.keys(reactHooks.rules).map((name) => [ `react-hooks/${name}`, 'off' ])),
        // Oxlint reports `export default {}` in story files as an anonymous component.
        'react-refresh/only-export-components': [ 'warn', { allowConstantExport: true } ],
      }
    }
  ]
);
