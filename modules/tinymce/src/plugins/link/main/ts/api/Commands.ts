import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as Dialog from '../ui/Dialog';

const register = (editor: Editor): void => {
  editor.addCommand('mceLink', (ui, dialog?: boolean ) => {
    if (dialog || !Options.useQuickLink(editor)) {
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
