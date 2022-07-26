import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';

const setup = (editor: Editor): void => {
  editor.editorManager.on('BeforeUnload', (e) => {
    let msg: string | undefined;

    Tools.each(EditorManager.get(), (editor) => {
      // Store a draft for each editor instance
      if (editor.plugins.autosave) {
        editor.plugins.autosave.storeDraft();
      }

      // Setup a return message if the editor is dirty
      if (!msg && editor.isDirty() && Options.shouldAskBeforeUnload(editor)) {
        msg = editor.translate('You have unsaved changes are you sure you want to navigate away?');
      }
    });

    if (msg) {
      e.preventDefault();
      e.returnValue = msg;
    }
  });
};

export {
  setup
};
