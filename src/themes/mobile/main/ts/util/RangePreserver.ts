import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

const platform = PlatformDetection.detect();
/* At the moment, this is only going to be used for Android. The Google keyboard
 * that comes with Android seems to shift the selection when the editor gets blurred
 * to the end of the word. This function rectifies that behaviour
 *
 * See fiddle: http://fiddle.tinymce.com/xNfaab/3 or http://fiddle.tinymce.com/xNfaab/4
 */
const preserve = function (f, editor) {
  const rng = editor.selection.getRng();
  f();
  editor.selection.setRng(rng);
};

const forAndroid = function (editor, f) {
  const wrapper = platform.os.isAndroid() ? preserve : Fun.apply;
  wrapper(f, editor);
};

export default {
  forAndroid
};