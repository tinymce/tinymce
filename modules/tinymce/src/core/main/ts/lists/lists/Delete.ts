import type Editor from '../../api/Editor';
import VK from '../../api/util/VK';
import * as Delete from '../actions/Delete';

const setup = (editor: Editor): void => {
  editor.on('init', () => {
    // Init is done after the editor's setup. This places our keydown after any keydowns registered in the setup function, so they can do default prevent.
    editor.on('keydown', (e) => {
      if (e.defaultPrevented) {
        return;
      }

      if (e.keyCode === VK.BACKSPACE) {
        if (Delete.backspaceDelete(editor, false)) {
          e.preventDefault();
        }
      } else if (e.keyCode === VK.DELETE) {
        if (Delete.backspaceDelete(editor, true)) {
          e.preventDefault();
        }
      }
    });
  });
};

export {
  setup
};
