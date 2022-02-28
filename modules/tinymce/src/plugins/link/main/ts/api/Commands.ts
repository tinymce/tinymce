import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';
import * as Options from './Options';

const register = (editor: Editor): void => {
  editor.addCommand('mceLink', () => {
    if (Options.useQuickLink(editor)) {
      // Taken from ContextEditorEvents in silver. Find a better way.
      editor.dispatch('contexttoolbar-show', {
        toolbarKey: 'quicklink'
      });
    } else {
      Actions.openDialog(editor)();
    }
  });
};

export {
  register
};
