import { Fun } from '@ephox/katamari';
import { Throttler } from '@ephox/katamari';
import { Window } from '@ephox/sand';
import Traverse from '../search/Traverse';
import Visibility from '../view/Visibility';
import { setInterval, clearInterval } from '@ephox/dom-globals';
import Element from '../node/Element';

// TypeScript does not include MutationObserver on the window object, and it's accessed that way for... reasons?
declare const window: any;

/*
 * Long term it's probably worth looking at using a single event per page the way Resize does.
 * This could get a bit slow with a lot of editors in a heavy page.
 *
 * It's a bit harder to manage, though, because visibility is a one-shot listener.
 */

var poll = function (element: Element, f) {
  var poller = setInterval(f, 500);

  var unbindPoll = function () {
    clearInterval(poller);
  };
  return unbindPoll;
};

var mutate = function (element: Element, f) {
  var observer = new window.MutationObserver(f);

  var unbindMutate = function () {
    observer.disconnect();
  };

  // childList is super expensive, but required on Safari where the iframe has no width or height immediately.
  // If it becomes a performance issue, we can make childList === isSafari but thus far Sugar has no platform detection so that would be a sad day.
  observer.observe(Traverse.owner(element).dom(), { attributes: true, subtree: true, childList: true, attributeFilter: [ 'style', 'class' ]});

  return unbindMutate;
};

// IE11 and above, not using numerosity so we can poll on IE10
var wait = window.MutationObserver !== undefined && window.MutationObserver !== null ? mutate : poll;

var onShow = function (element: Element, f) {
  if (Visibility.isVisible(element)) {
    Window.requestAnimationFrame(f);
    return Fun.noop;
  } else {
    // these events might come in thick and fast, so throttle them
    var throttler = Throttler.adaptable(function () {
      if (Visibility.isVisible(element)) {
        unbind();
        Window.requestAnimationFrame(f);
      }
    }, 100);

    var unbind = wait(element, throttler.throttle);

    return unbind;
  }
};

export default {
  onShow
};