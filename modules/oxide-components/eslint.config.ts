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
        // Fix indent rule with proper JSX configuration
        '@stylistic/indent': ['error', 2, {
          'SwitchCase': 1,
          'VariableDeclarator': 1,
          'outerIIFEBody': 1,
          'MemberExpression': 1,
          'FunctionDeclaration': {
            'parameters': 1,
            'body': 1
          },
          'FunctionExpression': {
            'parameters': 1,
            'body': 1
          },
          'CallExpression': {
            'arguments': 1
          },
          'ArrayExpression': 1,
          'ObjectExpression': 1,
          'ImportDeclaration': 1,
          'flatTernaryExpressions': false,
          'ignoreComments': false,
          'ignoredNodes': [
            'JSXElement',
            'JSXElement > *',
            'JSXAttribute',
            'JSXIdentifier',
            'JSXNamespacedName',
            'JSXMemberExpression',
            'JSXSpreadAttribute',
            'JSXExpressionContainer',
            'JSXOpeningElement',
            'JSXClosingElement',
            'JSXFragment',
            'JSXOpeningFragment',
            'JSXClosingFragment',
            'JSXText',
            'JSXEmptyExpression',
            'JSXSpreadChild'
          ]
        }],
      },
    },
    { ignores: [ 'lib' ] },
    storybookConfig
  ]
);
