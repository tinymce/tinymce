import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';

const register = (editor: Editor): void => {
  const showDialog = () => {
    Dialog.showDialog(editor);
  };

  editor.addCommand('mceMedia', showDialog);
};

export {
  register
};
