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
  plugins: 'insertdatetime code',
  toolbar: 'insertdatetime code',
  height: 600,
  menubar: 'insertdatetime',
  menu: {
    insertdatetime: {title: 'Insert Date/Time', items: 'insertdatetime'}
  },
});

export {};