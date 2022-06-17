import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';
import * as Options from './Options';

interface Dialog {
  readonly 'dialog': boolean;
}

const register = (editor: Editor): void => {
  editor.addCommand('mceLink', (_ui, value?: Dialog) => {
    if (value.dialog || !Options.useQuickLink(editor)) {
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
