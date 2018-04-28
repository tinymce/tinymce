/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const stringRepeat = function (string, repeats) {
  let str = '';

  for (let index = 0; index < repeats; index++) {
    str += string;
  }

  return str;
};

const isVisualCharsEnabled = function (editor) {
  return editor.plugins.visualchars ? editor.plugins.visualchars.isEnabled() : false;
};

const insertNbsp = function (editor, times) {
  const nbsp = isVisualCharsEnabled(editor) ? '<span class="mce-nbsp">&nbsp;</span>' : '&nbsp;';

  editor.insertContent(stringRepeat(nbsp, times));
  editor.dom.setAttrib(editor.dom.select('span.mce-nbsp'), 'data-mce-bogus', '1');
};

export default {
  insertNbsp
};