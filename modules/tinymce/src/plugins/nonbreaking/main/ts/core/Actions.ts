import Editor from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';

/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const stringRepeat = (string, repeats) => {
  let str = '';

  for (let index = 0; index < repeats; index++) {
    str += string;
  }

  return str;
};

const isVisualCharsEnabled = (editor: Editor) => {
  return editor.plugins.visualchars ? editor.plugins.visualchars.isEnabled() : false;
};

const insertNbsp = (editor: Editor, times: number) => {
  const nbsp = isVisualCharsEnabled(editor) ? '<span class="mce-nbsp">&nbsp;</span>' : '&nbsp;';

  editor.insertContent(stringRepeat(nbsp, times));
  Arr.each(editor.dom.select('span.mce-nbsp'), (span) => {
    editor.dom.setAttrib(span, 'data-mce-bogus', '1');
  });
};

export default {
  insertNbsp
};