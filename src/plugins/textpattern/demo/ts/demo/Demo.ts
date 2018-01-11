/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';

declare let tinymce: any;

TextPatternPlugin();

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'textpattern code',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  toolbar: 'code',
  height: 600
});