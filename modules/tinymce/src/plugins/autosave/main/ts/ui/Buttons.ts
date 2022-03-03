import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Storage from '../core/Storage';

const makeSetupHandler = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi) => {
  api.setEnabled(Storage.hasDraft(editor));
  const editorEventCallback = () => api.setEnabled(Storage.hasDraft(editor));
  editor.on('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
  return () => editor.off('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
};

const register = (editor: Editor): void => {
  // TODO: This was moved from makeSetupHandler as it would only be called when the menu item was rendered?
  //       Is it safe to start this process when the plugin is registered?
  Storage.startStoreDraft(editor);

  editor.ui.registry.addButton('restoredraft', {
    tooltip: 'Restore last draft',
    icon: 'restore-draft',
    onAction: () => {
      Storage.restoreLastDraft(editor);
    },
    onSetup: makeSetupHandler(editor)
  });

  editor.ui.registry.addMenuItem('restoredraft', {
    text: 'Restore last draft',
    icon: 'restore-draft',
    onAction: () => {
      Storage.restoreLastDraft(editor);
    },
    onSetup: makeSetupHandler(editor)
  });
};

export {
  register
};
