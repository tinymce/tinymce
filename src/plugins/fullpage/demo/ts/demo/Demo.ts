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
  plugins: 'fullpage code',
  toolbar: 'fullpage code',
  height: 600,
  menubar: 'view tools custom',
  menu: {
    custom: { title: 'Custom', items: 'fullpage' }
  }
});

export {};