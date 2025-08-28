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
          tsconfigRootDir: "."
        },
      },
      plugins: {
        onlyWarn,
      },
      rules: {
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
