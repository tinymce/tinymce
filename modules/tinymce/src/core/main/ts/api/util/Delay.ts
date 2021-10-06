/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../Editor';
import Promise from './Promise';

interface DebounceFunc<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  stop: () => void;
}

interface Delay {
  requestAnimationFrame: (callback: () => void, element?: HTMLElement) => void;
  setEditorInterval: (editor: Editor, callback: () => void, time?: number) => number;
  setEditorTimeout: (editor: Editor, callback: () => void, time?: number) => number;
  setInterval: (callback: () => void, time?: number) => number;
  setTimeout: (callback: () => void, time?: number) => number;
  clearInterval: (id?: number) => void;
  clearTimeout: (id?: number) => void;
  debounce: <T extends (...args: any[]) => any>(callback: T, time?: number) => DebounceFunc<T>;
  throttle: <T extends (...args: any[]) => any>(callback: T, time?: number) => DebounceFunc<T>;
}

/**
 * Utility class for working with delayed actions like setTimeout.
 *
 * @class tinymce.util.Delay
 */

let requestAnimationFramePromise;

const requestAnimationFrame = (callback: () => void, element?: HTMLElement) => {
  let requestAnimationFrameFunc: any = window.requestAnimationFrame;
  const vendors = [ 'ms', 'moz', 'webkit' ];

  const featurefill = (cb: () => void) => {
    window.setTimeout(cb, 0);
  };

  for (let i = 0; i < vendors.length && !requestAnimationFrameFunc; i++) {
    requestAnimationFrameFunc = window[vendors[i] + 'RequestAnimationFrame'];
  }

  if (!requestAnimationFrameFunc) {
    requestAnimationFrameFunc = featurefill;
  }

  requestAnimationFrameFunc(callback, element);
};

const wrappedSetTimeout = (callback: () => void, time?: number) => {
  if (typeof time !== 'number') {
    time = 0;
  }

  return setTimeout(callback, time);
};

const wrappedSetInterval = (callback: Function, time?: number): number => {
  if (typeof time !== 'number') {
    time = 1; // IE 8 needs it to be > 0
  }

  return setInterval(callback, time);
};

const wrappedClearTimeout = (id?: number) => {
  return clearTimeout(id);
};

const wrappedClearInterval = (id?: number) => {
  return clearInterval(id);
};

const debounce = <T extends (...args: any[]) => any>(callback: T, time?: number): DebounceFunc<T> => {
  let timer;

  const func = (...args: Parameters<T>): void => {
    clearTimeout(timer);

    timer = wrappedSetTimeout(function () {
      callback.apply(this, args);
    }, time);
  };

  func.stop = () => {
    clearTimeout(timer);
  };

  return func;
};

const Delay: Delay = {
  /**
   * Requests an animation frame and fallbacks to a timeout on older browsers.
   * <br>
   * <em>Deprecated in TinyMCE 5.10 and has been marked for removal in TinyMCE 6.0</em> - use the native browser <code>requestAnimationFrame</code> API instead.
   *
   * @deprecated
   * @method requestAnimationFrame
   * @param {function} callback Callback to execute when a new frame is available.
   * @param {DOMElement} element Optional element to scope it to.
   */
  requestAnimationFrame: (callback, element?) => {
    if (requestAnimationFramePromise) {
      requestAnimationFramePromise.then(callback);
      return;
    }

    requestAnimationFramePromise = new Promise<void>((resolve) => {
      if (!element) {
        element = document.body;
      }

      requestAnimationFrame(resolve, element);
    }).then(callback);
  },

  /**
   * Sets a timer in ms and executes the specified callback when the timer runs out.
   * <br>
   * <em>Deprecated in TinyMCE 5.10 and has been marked for removal in TinyMCE 6.0</em> - use the native browser <code>setTimeout</code> API instead.
   *
   * @deprecated
   * @method setTimeout
   * @param {function} callback Callback to execute when timer runs out.
   * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
   * @return {Number} Timeout id number.
   */
  setTimeout: wrappedSetTimeout,

  /**
   * Sets an interval timer in ms and executes the specified callback at every interval of that time.
   * <br>
   * <em>Deprecated in TinyMCE 5.10 and has been marked for removal in TinyMCE 6.0</em> - use the native browser <code>setInterval</code> API instead.
   *
   * @deprecated
   * @method setInterval
   * @param {function} callback Callback to execute when interval time runs out.
   * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
   * @return {Number} Timeout id number.
   */
  setInterval: wrappedSetInterval,

  /**
   * Sets an editor timeout it's similar to setTimeout except that it checks if the editor instance is
   * still alive when the callback gets executed.
   *
   * @method setEditorTimeout
   * @param {tinymce.Editor} editor Editor instance to check the removed state on.
   * @param {function} callback Callback to execute when timer runs out.
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
   * Sets an interval timer it's similar to setInterval except that it checks if the editor instance is
   * still alive when the callback gets executed.
   *
   * @method setEditorInterval
   * @param {function} callback Callback to execute when interval time runs out.
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
  },

  /**
   * Creates debounced callback function that only gets executed once within the specified time.
   * <br>
   * <em>Deprecated in TinyMCE 5.10 and has been marked for removal in TinyMCE 6.0.</em>
   *
   * @deprecated
   * @method debounce
   * @param {function} callback Callback to execute when timer finishes.
   * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
   * @return {Function} debounced function callback.
   */
  debounce,

  // Throttle needs to be debounce due to backwards compatibility.
  throttle: debounce,

  /**
   * Clears an interval timer so it won't execute.
   * <br>
   * <em>Deprecated in TinyMCE 5.10 and has been marked for removal in TinyMCE 6.0</em> - use the native browser <code>clearInterval</code> API instead.
   *
   * @deprecated
   * @method clearInterval
   * @param {Number} Interval timer id number.
   */
  clearInterval: wrappedClearInterval,

  /**
   * Clears an timeout timer so it won't execute.
   * <br>
   * <em>Deprecated in TinyMCE 5.10 and has been marked for removal in TinyMCE 6.0</em> - use the native browser <code>clearTimeout</code> API instead.
   *
   * @deprecated
   * @method clearTimeout
   * @param {Number} Timeout timer id number.
   */
  clearTimeout: wrappedClearTimeout
};

export default Delay;
