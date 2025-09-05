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
    { ignores: [ 'lib' ] },
    storybookConfig
  ]
);
