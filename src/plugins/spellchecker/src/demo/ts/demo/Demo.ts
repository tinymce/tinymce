/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import SpellCheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';

/*eslint no-console:0 */

declare let tinymce: any;

SpellCheckerPlugin();

tinymce.init({
  selector: "textarea.tinymce",
  plugins: "spellchecker code",
  toolbar: "spellchecker code",
  skin_url: "../../../../../skins/lightgray/dist/lightgray",
  height: 600
});