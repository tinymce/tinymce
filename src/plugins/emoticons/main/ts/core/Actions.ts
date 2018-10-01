import { Editor } from 'tinymce/core/api/Editor';

const insertEmoticon = function (editor: Editor, ch: string): void {
  editor.insertContent(ch);
};

export {
  insertEmoticon
};