import { Arr, Fun } from '@ephox/katamari';
import { DomEvent, Focus, Node } from '@ephox/sugar';

import CaptureBin from '../../util/CaptureBin';
import ResumeEditing from '../focus/ResumeEditing';

/*
 * Stubborn IOS Keyboard mode:
 *
 * The keyboard will stubbornly refuse to go away. The only time it will go away is when toReading
 * is called (which is currently only used by the insert image button). It will probably go away
 * at other times, but we never explicitly try to make it go away.
 *
 * The major problem with not dismissing the keyboard when the user presses the toolbar is that
 * the input focus can be put in some very interesting things. Once the input focus is in something
 * that is not the content or an input that the user can clearly see, behaviour gets very strange
 * very quickly. The Stubborn keyboard tries to resolve this issue in a few ways:
 *
 * 1. After scrolling the toolbar, it resumes editing of the content. This has the built-in assumption
 * that there are no slick toolbars that require scrolling AND input focus
 * 2. Any time a keydown is received on the outer page, we resume editing of the content. What this means
 * is that in situations where the user has still managed to get into the toolbar (e.g. they typed while
 * the dropdown was visible, or the insert image toReading didn't quite work etc.), then the first keystroke
 * sends the input back to the content, and then subsequent keystrokes appear in the content. Although
 * this means that their first keystroke is lost, it is a reasonable way of ensuring that they don't
 * get stuck in some weird input somewhere. The goal of the stubborn keyboard is to view this as a
 * fallback ... we want to prevent it getting to this state wherever possible. However, there are just
 * some situations where we really don't know what typing on the keyboard should do (e.g. a dropdown is open).
 * Note, when we transfer the focus back to the content, we also close any menus that are still visible.
 *
 * Now, because in WebView mode, the actual window is shrunk when the keyboard appears, the dropdown vertical
 * scrolling is set to the right height. However, when running as a webapp, this won't be the case. To use
 * the stubborn keyboard in webapp mode, we will need to find some way to let repartee know the MaxHeight
 * needs to exclude the keyboard. This isn't a problem with timid, because the keyboard is dismissed.
 */
const stubborn = function (outerBody, cWin, page, frame/*, toolstrip, toolbar*/) {
  const toEditing = function () {
    ResumeEditing.resume(cWin, frame);
  };

  const toReading = function () {
    CaptureBin.input(outerBody, Focus.blur);
  };

  const captureInput = DomEvent.bind(page, 'keydown', function (evt) {
    // Think about killing the event.
    if (! Arr.contains([ 'input', 'textarea' ], Node.name(evt.target()))) {

      // FIX: Close the menus
      // closeMenus()

      toEditing();
    }
  });

  const onToolbarTouch = function (/* event */) {
    // Do nothing
  };

  const destroy = function () {
    captureInput.unbind();
  };

  return {
    toReading,
    toEditing,
    onToolbarTouch,
    destroy
  };
};

/*
 * Timid IOS Keyboard mode:
 *
 * In timid mode, the keyboard will be dismissed as soon as the toolbar is clicked. In lot of
 * situations, it will then quickly reappear is toEditing is called. The timid mode is safe,
 * but can be very jarring.
 *
 * One situation that the timid mode does not handle is when in a WebView, if the user has
 * scrolled to the bottom of the content and is editing it, as soon as they click on a formatting
 * operation, the keyboard will be dismissed, and the content will visibly jump back down to
 * the bottom of the screen (because the increased window size has decreased the amount of
 * scrolling available). As soon as the formatting operation is completed (which can be
 * instantaneously for something like bold), then the keyboard reappears and the content
 * jumps again. It's very jarring and there's not much we can do (I think).
 *
 * However, the timid keyboard mode will seamlessly integrate with dropdowns max-height, because
 * dropdowns dismiss the keyboard, so they have all the height they require.
 */
const timid = function (outerBody, cWin, page, frame/*, toolstrip, toolbar*/) {
  const dismissKeyboard = function () {
    Focus.blur(frame);
  };

  const onToolbarTouch = function () {
    dismissKeyboard();
  };

  const toReading = function () {
    dismissKeyboard();
  };

  const toEditing = function () {
    ResumeEditing.resume(cWin, frame);
  };

  return {
    toReading,
    toEditing,
    onToolbarTouch,
    destroy: Fun.noop
  };
};

export default {
  stubborn,
  timid
};