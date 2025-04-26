import rootConfig from "../../eslint.config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...rootConfig,
  {
    rules: {
      //"@typescript-eslint/no-misused-promises": "off",
      //"@typescript-eslint/no-floating-promises": "off",
      "@tinymce/no-direct-editor-events": "off",
      "@tinymce/no-implicit-dom-globals": [
        "error", {
          allowed: [ "btoa", "fetch", "requestAnimationFrame", "InputEvent" ],
          appendDefaults: true
        }
      ]
    }
  },
  {
    languageOptions: {
      "parserOptions": {
        "project": "./tsconfig.eslint.json",
        "tsconfigRootDir": __dirname,
      }
    },
  }
])
