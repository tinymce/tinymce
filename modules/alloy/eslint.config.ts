
import rootConfig from '../../eslint.config'
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...rootConfig,
  {
    rules: {
      "@tinymce/no-implicit-dom-globals": [ "error", {
        allowed: [ "requestAnimationFrame" ],
        appendDefaults: true
      }]
    }
  }
])
