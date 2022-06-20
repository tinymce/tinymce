import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';
import * as Options from './Options';

interface CommandOptions {
  readonly dialog?: boolean;
}

const register = (editor: Editor): void => {
  editor.addCommand('mceLink', (_ui, value?: CommandOptions) => {
    if (value?.dialog === true || !Options.useQuickLink(editor)) {
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
