import Editor from 'tinymce/core/api/Editor';
import Settings from '../api/Settings';

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
  const classes = () => isVisualCharsEnabled(editor) ? `mce-nbsp-wrap mce-nbsp` : `mce-nbsp-wrap`;
  const nbspSpan = () => `<span class="${classes()}" contenteditable="false">${stringRepeat('&nbsp;', times)}</span>`;

  const wrap = Settings.wrapNbsps(editor);
  const html = wrap || editor.plugins.visualchars ? nbspSpan() : stringRepeat('&nbsp;', times);

  editor.undoManager.transact(() => editor.insertContent(html));
};

export default {
  insertNbsp
};