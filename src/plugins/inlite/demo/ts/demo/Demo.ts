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
  plugins: 'inlite link code',
  toolbar: 'inlite code',
  menubar: 'view insert tools custom',
  link_quicklink: true,
  height: 600,
  setup: (ed) => {
    ed.on('init', () => {
      ed.hasVisual = true;
      ed.addVisual();
    });

    ed.on('init', () => {
      ed.setContent('<h1>Heading</h1><p><a name="anchor1"></a>anchor here.');
    });
  }
});

export {};
