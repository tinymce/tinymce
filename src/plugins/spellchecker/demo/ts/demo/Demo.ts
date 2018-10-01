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
  selector: 'textarea.tinymce',
  plugins: 'spellchecker code',
  toolbar: 'spellchecker code',
  spellchecker_languages: 'English=en,Spanish=es',
  theme: 'silver',
  spellchecker_callback: (method, text, success, failure) => {
    const words = text.match(this.getWordCharPattern());
    if (method === 'spellcheck' && words != null) {
      const suggestions = {};
      for (let i = 0; i < words.length; i++) {
        suggestions[words[i]] = ['First', 'Second'];
      }
      success(suggestions);
    }
  },
  height: 600
});

export {};