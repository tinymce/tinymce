import Global from '../util/Global';

/******************************************************************************************
 * BIG BIG WARNING: Don't put anything other than top-level window functions in here.
 *
 * Objects that are technically available as window.X should be in their own module X (e.g. Blob, FileReader, URL).
 ******************************************************************************************
 */

/*
 * IE10 and above per
 * https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame
 */
const requestAnimationFrame = function (callback: Function) {
  const f: typeof requestAnimationFrame = Global.getOrDie('requestAnimationFrame');
  f(callback);
};

/*
 * IE10 and above per
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.atob
 */
const atob = function (base64: any) {
  const f: typeof atob = Global.getOrDie('atob');
  return f(base64);
};

export default {
  atob,
  requestAnimationFrame
};