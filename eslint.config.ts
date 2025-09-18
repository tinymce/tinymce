import tinyPlugin from '@tinymce/eslint-plugin';
import onlyWarn from 'eslint-plugin-only-warn';
import { defineConfig } from "eslint/config";

export default defineConfig(
  [
    tinyPlugin.configs.editor,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          // tsconfigRootDir tells the parser the absolute path of the project's root directory
          // When using relative paths, they resolve relative to the working directory of the process
          // running the CLI, not the config file location. Using import.meta.dirname ensures
          // paths resolve correctly regardless of where ESLint is executed from.
          // See: https://typescript-eslint.io/packages/parser/#tsconfigrootdir
          tsconfigRootDir: import.meta.dirname
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
