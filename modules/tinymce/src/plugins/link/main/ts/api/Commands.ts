import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';

const register = (editor: Editor): void => {
  editor.addCommand('mceLink', (_ui) => {
    if (_ui) {
      Dialog.open(editor);
    } else {
      editor.dispatch('contexttoolbar-show', {
        toolbarKey: 'quicklink'
      });
    }
  });
};

export {
  register
};
