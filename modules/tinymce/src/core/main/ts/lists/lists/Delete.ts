import Editor from '../../api/Editor';
import VK from '../../api/util/VK';
import * as Delete from '../actions/Delete';

const setup = (editor: Editor): void => {
  editor.on('keydown', (e) => {
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
};

export {
  setup
};
