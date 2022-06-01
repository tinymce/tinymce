import { Type } from '@ephox/katamari';

import Editor from '../Editor';

interface Delay {
  setEditorInterval: (editor: Editor, callback: () => void, time?: number) => number;
  setEditorTimeout: (editor: Editor, callback: () => void, time?: number) => number;
}

/**
 * Utility class for working with delayed actions like setTimeout.
 *
 * @class tinymce.util.Delay
 */

const wrappedSetTimeout = (callback: () => void, time?: number) => {
  if (!Type.isNumber(time)) {
    time = 0;
  }

  return setTimeout(callback, time);
};

const wrappedSetInterval = (callback: Function, time?: number): number => {
  if (!Type.isNumber(time)) {
    time = 0;
  }

  return setInterval(callback, time);
};

const Delay: Delay = {
  /**
   * Sets a timeout that's similar to the native browser <a href="https://developer.mozilla.org/en-US/docs/Web/API/setTimeout">setTimeout</a>
   * API, except that it checks if the editor instance is still alive when the callback gets executed.
   *
   * @method setEditorTimeout
   * @param {tinymce.Editor} editor Editor instance to check the removed state on.
   * @param {Function} callback Callback to execute when timer runs out.
   * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
   * @return {Number} Timeout id number.
   */
  setEditorTimeout: (editor, callback, time?) => {
    return wrappedSetTimeout(() => {
      if (!editor.removed) {
        callback();
      }
    }, time);
  },

  /**
   * Sets an interval timer that's similar to native browser <a href="https://developer.mozilla.org/en-US/docs/Web/API/setInterval">setInterval</a>
   * API, except that it checks if the editor instance is still alive when the callback gets executed.
   *
   * @method setEditorInterval
   * @param {Function} callback Callback to execute when interval time runs out.
   * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
   * @return {Number} Timeout id number.
   */
  setEditorInterval: (editor, callback, time?) => {
    const timer = wrappedSetInterval(() => {
      if (!editor.removed) {
        callback();
      } else {
        clearInterval(timer);
      }
    }, time);

    return timer;
  }
};

export default Delay;
