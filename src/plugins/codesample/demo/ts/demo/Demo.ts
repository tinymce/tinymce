/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CodeSamplePlugin from 'tinymce/plugins/codesample/Plugin';

declare let tinymce: any;

CodeSamplePlugin();

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'codesample code',
  toolbar: 'codesample code',
  codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css',
  height: 600
});