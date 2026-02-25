import { Result } from '@ephox/katamari';

import type Editor from '../api/Editor';
import * as InputEvents from '../events/InputEvents';

const symulateDelete = (editor: Editor, isForward: boolean, deleteFun: () => void): Result<undefined, undefined> => {
  // Some delete actions may prevent the input event from being fired. If we do not detect it, we fire it ourselves.
  let shouldFireInput = true;
  const inputHandler = () => shouldFireInput = false;

  const beforeInputEvent = InputEvents.fireBeforeInputEvent(editor, isForward ? 'deleteContentForward' : 'deleteContentBackward');

  if (beforeInputEvent.isDefaultPrevented()) {
    return Result.error(undefined);
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
  return Result.value(undefined);
};

export {
  symulateDelete
};
