/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import InsertDateTimePlugin from 'tinymce/plugins/insertdatetime/Plugin';

declare let tinymce: any;

InsertDateTimePlugin();

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'insertdatetime code',
  toolbar: 'insertdatetime code',
  height: 600
});