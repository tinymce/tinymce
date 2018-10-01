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
import Dialog from '../../../main/ts/ui/Dialog';

declare let tinymce: any;

const element: any = document.querySelector('.tinymce');
element.value = '<table><tbody><tr><td>One</td></tr></tbody></table>';

const getSelectColor = (ed) => {
  return (hex) => {
    console.log('you chose: ' + hex);
    const selectColor = getSelectColor(ed);
    setTimeout(() => {
      Dialog.open(ed, selectColor, '#ffffff');
    }, 1000);
  };
};

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'colorpicker',
  height: 600,
  init_instance_callback: (ed) => {
    Dialog.open(ed, getSelectColor(ed), '#ffffff');
  }
});

export {};