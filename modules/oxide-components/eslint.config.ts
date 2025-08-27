import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import * as storybook from 'eslint-plugin-storybook';
import globals from 'globals';

import rootConfig from '../../eslint.config.ts';


const storybookConfig = storybook.configs['flat/recommended'];


export default defineConfig(
  [
    ...rootConfig,
    {
      files: [ '**/*.{ts,tsx}' ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
      },
    },
    // TINY-12801: Temporary workaround until issue with @stylistic/indent rule introduced in TypeScript 5.9.2 is resolved.
    // See https://github.com/microsoft/TypeScript/issues/62188
    {
      files: ["**/*.tsx"],
      rules: {
        "@stylistic/indent": "off"
      }
    },
    {
      files: ["**/*.ts"],
      rules: {
        "@stylistic/indent": ["error", 2]
      }
    },
    { ignores: [ 'lib' ] },
    storybookConfig
  ]
);
