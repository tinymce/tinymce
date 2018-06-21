/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { document } from '@ephox/dom-globals';

declare let tinymce: any;

const button = document.querySelector('button.clicky');
button.addEventListener('click', function () {
  tinymce.activeEditor.insertContent(content);
});
const content = '<span class="mceNonEditable">[NONEDITABLE]</span>';
const button2 = document.querySelector('button.boldy');
button2.addEventListener('click', function () {
  tinymce.activeEditor.execCommand('bold');
});

tinymce.init({
  selector: 'div.tinymce',
  theme: 'modern',
  inline: true,
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'noneditable code',
  toolbar: 'code',
  height: 600
});

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'noneditable code',
  toolbar: 'code',
  height: 600
});

export {};