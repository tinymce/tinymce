import tinyPlugin from '@tinymce/eslint-plugin';
import onlyWarn from 'eslint-plugin-only-warn';
import { defineConfig } from "eslint/config";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(
  [
    ...tinyPlugin.configs.editor,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: __dirname
        },
      },
      plugins: {
        onlyWarn,
      },
      rules: {
        "@typescript-eslint/no-import-type-side-effects": "error",
        "@typescript-eslint/consistent-type-exports": "error",
        "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: 'inline-type-imports' }],

        "@typescript-eslint/camelcase": "off", // leave off
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/prefer-regexp-exec": "off",
        "@typescript-eslint/require-await": "off",
        "no-empty": "off",
        "no-underscore-dangle": "off",
        "one-var": "off",
        "prefer-rest-params": "off",
        "prefer-spread": "off",
        "max-len": [
          "warn",
          260
        ],
      },
    },
    {
      files: [
        "**/demo/*.ts"
      ],
      rules: {
        "@typescript-eslint/no-floating-promises": "off",
      }
    }
  ]
)
