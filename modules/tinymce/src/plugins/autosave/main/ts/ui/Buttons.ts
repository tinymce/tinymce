import Editor from 'tinymce/core/api/Editor';

import * as Storage from '../core/Storage';

interface Api {
  setEnabled: (enabled: boolean) => void;
}

const makeSetupHandler = (editor: Editor) => (api: Api) => {
  api.setEnabled(Storage.hasDraft(editor));
  const editorEventCallback = () => api.setEnabled(Storage.hasDraft(editor));
  editor.on('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
  return () => editor.off('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
};

const register = (editor: Editor): void => {
  // TODO: This was moved from makeSetupHandler as it would only be called when the menu item was rendered?
  //       Is it safe to start this process when the plugin is registered?
  Storage.startStoreDraft(editor);

  const onAction = () => {
    Storage.restoreLastDraft(editor);
  };

  editor.ui.registry.addButton('restoredraft', {
    tooltip: 'Restore last draft',
    icon: 'restore-draft',
    onAction,
    onSetup: makeSetupHandler(editor)
  });

  editor.ui.registry.addMenuItem('restoredraft', {
    text: 'Restore last draft',
    icon: 'restore-draft',
    onAction,
    onSetup: makeSetupHandler(editor)
  });
};

export {
  register
};
