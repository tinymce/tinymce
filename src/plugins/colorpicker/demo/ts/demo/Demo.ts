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

const element: any = document.querySelector('.tinymce');
element.value = '<table><tbody><tr><td>One</td></tr></tbody></table>';

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'table colorpicker code',
  toolbar: 'table code',
  height: 600
});

export {};