/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import TocPlugin from 'tinymce/plugins/toc/Plugin';

/*eslint no-console:0 */

declare let tinymce: any;

TocPlugin();

tinymce.init({
  selector: "textarea.tinymce",
  plugins: "toc code",
  toolbar: "toc code formatselect",
  skin_url: "../../../../../skins/lightgray/dist/lightgray",
  height: 600
});