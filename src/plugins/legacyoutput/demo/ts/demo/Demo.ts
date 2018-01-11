/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import LegacyOutputPlugin from 'tinymce/plugins/legacyoutput/Plugin';

declare let tinymce: any;

LegacyOutputPlugin();

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'legacyoutput code',
  toolbar: 'legacyoutput fontselect fontsizeselect code',
  height: 600
});