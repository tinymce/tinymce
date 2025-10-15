import rootConfig from '../../eslint.config'
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...rootConfig,
  {
    rules: {
      "@tinymce/no-implicit-dom-globals": "off",
      "@tinymce/no-direct-imports": "off",
      "consistent-this": "off"
    }
  }
])
