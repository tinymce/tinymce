/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';

declare let tinymce: any;

VisualCharsPlugin();

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'visualchars code',
  toolbar: 'visualchars code',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  height: 600
});