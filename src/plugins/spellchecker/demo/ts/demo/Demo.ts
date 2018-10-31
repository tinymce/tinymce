/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

tinymce.init({
  language: 'es',
  selector: 'textarea.tinymce',
  theme: 'silver',

  plugins: 'spellchecker code',
  toolbar: 'spellchecker code',

  spellchecker_language: 'en',
  spellchecker_languages: 'English=en,Spanish=es',
  spellchecker_callback: (method, text, success, failure) => {
    const words = text.match(tinymce.activeEditor.plugins.spellchecker.getWordCharPattern());

    if (method === 'spellcheck' && words != null) {
      const suggestions = {};
      for (let i = 0; i < words.length; i++) {
        suggestions[words[i]] = ['First', 'Second'];
      }
      tinymce.activeEditor.plugins.spellchecker.markErrors(suggestions);
    }
  },
  height: 600
});

export {};