import type Editor from '../../api/Editor';
import VK from '../../api/util/VK';
import * as InputEvents from '../../events/InputEvents';
import * as Delete from '../actions/Delete';

const setup = (editor: Editor): void => {
  editor.on('init', () => {
    // Init is done after the editor's setup. This places our keydown after any keydowns registered in the setup function, so they can do default prevent.
    editor.on('keydown', (e) => {
      if (e.defaultPrevented) {
        return;
      }

      if (e.keyCode === VK.BACKSPACE) {
        const beforeInput = InputEvents.fireBeforeInputEvent(editor, 'deleteContentBackward');
        if (!beforeInput.isDefaultPrevented() && Delete.backspaceDelete(editor, false)) {
          e.preventDefault();
        }
      } else if (e.keyCode === VK.DELETE) {
        const beforeInput = InputEvents.fireBeforeInputEvent(editor, 'deleteContentForward');
        if (!beforeInput.isDefaultPrevented() && Delete.backspaceDelete(editor, true)) {
          e.preventDefault();
        }
      }
    });
  });
};

export {
  setup
};
