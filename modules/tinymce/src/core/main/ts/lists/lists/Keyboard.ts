
import Editor from '../../api/Editor';
import * as Options from '../../api/Options';
import VK from '../../api/util/VK';
import { indentListSelection, outdentListSelection } from '../actions/Indentation';

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
};

export {
  setup
};
