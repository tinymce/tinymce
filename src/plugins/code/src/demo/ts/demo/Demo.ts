/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CodePlugin from 'tinymce/plugins/code/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

CodePlugin();
ModernTheme();

declare const tinymce: any;

tinymce.init({
  selector: "textarea.tinymce",
  theme: "modern",
  skin_url: "../../../../../skins/lightgray/dist/lightgray",
  plugins: "code",
  toolbar: "code",
  height: 600
});
