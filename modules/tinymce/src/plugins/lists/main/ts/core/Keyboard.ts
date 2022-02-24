import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import { indentListSelection, outdentListSelection } from '../actions/Indendation';
import * as Options from '../api/Options';
import * as Delete from './Delete';

const setupTabKey = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    // Check for tab but not ctrl/cmd+tab since it switches browser tabs
    if (e.keyCode !== VK.TAB || VK.metaKeyPressed(e)) {
      return;
    }

    editor.undoManager.transact(() => {
      if (e.shiftKey ? outdentListSelection(editor) : indentListSelection(editor)) {
        e.preventDefault();
      }
    });
  });
};

const setup = (editor: Editor): void => {
  if (Options.shouldIndentOnTab(editor)) {
    setupTabKey(editor);
  }

  Delete.setup(editor);
};

export {
  setup
};
