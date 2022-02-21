import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const stringRepeat = (string: string, repeats: number): string => {
  let str = '';

  for (let index = 0; index < repeats; index++) {
    str += string;
  }

  return str;
};

const isVisualCharsEnabled = (editor: Editor) => editor.plugins.visualchars ? editor.plugins.visualchars.isEnabled() : false;

const insertNbsp = (editor: Editor, times: number): void => {
  const classes = () => isVisualCharsEnabled(editor) ? 'mce-nbsp-wrap mce-nbsp' : 'mce-nbsp-wrap';
  const nbspSpan = () => `<span class="${classes()}" contenteditable="false">${stringRepeat('&nbsp;', times)}</span>`;

  const shouldWrap = Options.wrapNbsps(editor);
  const html = shouldWrap || editor.plugins.visualchars ? nbspSpan() : stringRepeat('&nbsp;', times);

  editor.undoManager.transact(() => editor.insertContent(html));
};

export {
  insertNbsp
};
