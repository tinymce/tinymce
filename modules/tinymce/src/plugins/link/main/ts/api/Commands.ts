import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';
import * as Options from './Options';

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
