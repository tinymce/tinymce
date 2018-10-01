/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'searchreplace',
  toolbar: 'searchreplace',
  height: 600,
  menubar: 'custom',
  menu: {
    custom: { title: 'Custom', items: 'searchreplace' }
  }
});

export {};