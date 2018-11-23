/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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