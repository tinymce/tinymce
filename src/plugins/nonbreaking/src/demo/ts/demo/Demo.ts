/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import NonBreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';

/*eslint no-console:0 */

declare let tinymce: any;

NonBreakingPlugin();

tinymce.init({
  selector: "textarea.tinymce",
  theme: "modern",
  skin_url: "../../../../../skins/lightgray/dist/lightgray",
  plugins: "nonbreaking code",
  toolbar: "nonbreaking code",
  height: 600
});