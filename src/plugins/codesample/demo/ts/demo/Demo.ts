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
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'codesample code',
  toolbar: 'codesample code',
  codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css',
  height: 600
});

tinymce.init({
  selector: 'div.tinymce',
  inline: true,
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'codesample code',
  toolbar: 'codesample code',
  codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css',
  height: 600
});

export {};
