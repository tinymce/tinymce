import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';

const register = (editor: Editor): void => {
  editor.addCommand('mceCodeEditor', () => {
    Dialog.open(editor);
  });
};

export {
  register
};
