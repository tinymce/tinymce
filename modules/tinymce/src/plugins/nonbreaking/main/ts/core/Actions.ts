import Editor from 'tinymce/core/api/Editor';
import DOMUtils from '../../../../../core/main/ts/api/dom/DOMUtils';

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
  editor.dom.setAttrib(editor.dom.select('span.mce-nbsp')[0], 'data-mce-bogus', '1');

  // testing purposes
  insertNbspWrap(editor);
};

const insertNbspWrap = (editor: Editor) => {
  // const dom: DOMUtils = editor.dom;
  const selectedElm = editor.selection.getNode();
  // @ts-ignore
  console.log(selectedElm, editor.selection.getRng());
};

export default {
  insertNbsp,
  insertNbspWrap
};