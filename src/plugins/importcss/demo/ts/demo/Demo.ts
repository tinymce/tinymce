/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { document } from '@ephox/dom-globals';

declare let tinymce: any;

const elm: any = document.querySelector('.tinymce');
elm.value = 'The format menu should show "red"';

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'importcss code',
  toolbar: 'styleselect code',
  height: 600,
  content_css: '../css/rules.css'
});

export {};