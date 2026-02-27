
import type Editor from '../api/Editor';
import * as InputEvents from '../events/InputEvents';

const symulateDelete = (editor: Editor, isForward: boolean, deleteFun: () => void): boolean => {
  // Some delete actions may prevent the input event from being fired. If we do not detect it, we fire it ourselves.
  let shouldFireInput = true;
  const inputHandler = () => shouldFireInput = false;

  const beforeInputEvent = InputEvents.fireBeforeInputEvent(editor, isForward ? 'deleteContentForward' : 'deleteContentBackward');

  if (beforeInputEvent.isDefaultPrevented()) {
    return false;
  }

  editor.on('input', inputHandler);
  try {
    deleteFun();
  } finally {
    editor.off('input', inputHandler);
  }

  if (shouldFireInput) {
    editor.dispatch('input');
  }
  return true;
};

export {
  symulateDelete
};
