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
  plugins: 'textcolor code colorpicker',
  toolbar: 'forecolor backcolor code',
  height: 600,
  // textcolor_cols: 1
  textcolor_map: [
    { text: 'Black', value: '#000000' },
    { text: 'Burnt orange', value: '#993300' }
  ],
});

export {};