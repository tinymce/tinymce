import type Editor from '../api/Editor';
import * as InputEvents from '../events/InputEvents';

const SymulateDelete = (editor: Editor, isForward: boolean, deleteFun: () => void): void => {
  // Some delete actions may prevent the input event from being fired. If we do not detect it, we fire it ourselves.
  let shouldFireInput = true;
  const inputHandler = () => shouldFireInput = false;

  const beforeInputEvent = InputEvents.fireBeforeInputEvent(editor, isForward ? 'deleteContentForward' : 'deleteContentBackward');

  if (beforeInputEvent.isDefaultPrevented()) {
    return;
  }

  editor.on('input', inputHandler);
  deleteFun();
  editor.off('input', inputHandler);

  if (shouldFireInput) {
    editor.dispatch('input');
  }
};

export {
  SymulateDelete
};
