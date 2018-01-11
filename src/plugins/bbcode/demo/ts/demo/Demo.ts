/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import BbCodePlugin from 'tinymce/plugins/bbcode/Plugin';

/*eslint no-console:0, no-unused-vars: 0 */

declare let tinymce: any;

BbCodePlugin();

let elm: any;
elm = document.querySelector('.tinymce');
elm.value = '[b]bbcode plugin[/b]';

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'bbcode code',
  toolbar: 'bbcode code',
  height: 600
});