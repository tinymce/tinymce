import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';

export interface Api {
  readonly showDialog: () => void;
}

const get = (editor: Editor): Api => {
  const showDialog = () => {
    Dialog.showDialog(editor);
  };

  return {
    showDialog
  };
};

export {
  get
};
