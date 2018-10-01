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
  plugins: 'charmap',
  toolbar: 'charmap',
  height: 600,
  charmap_append: [['A'.charCodeAt(0), 'A'], ['B'.charCodeAt(0), 'B'], ['C'.charCodeAt(0), 'C']],
});

export {};