import { clearInterval, setInterval } from '@ephox/dom-globals';
import { Fun, Throttler } from '@ephox/katamari';
import { Window } from '@ephox/sand';
import Element from '../node/Element';
import * as Traverse from '../search/Traverse';
import * as Visibility from '../view/Visibility';

// TypeScript does not include MutationObserver on the window object, and it's accessed that way for... reasons?
declare const window: any;

/*
 * Long term it's probably worth looking at using a single event per page the way Resize does.
 * This could get a bit slow with a lot of editors in a heavy page.
 *
 * It's a bit harder to manage, though, because visibility is a one-shot listener.
 */

const poll = function (element: Element, f) {
  const poller = setInterval(f, 500);

  const unbindPoll = function () {
    clearInterval(poller);
  };
  return unbindPoll;
};

const mutate = function (element: Element, f) {
  const observer = new window.MutationObserver(f);

  const unbindMutate = function () {
    observer.disconnect();
  };

  // childList is super expensive, but required on Safari where the iframe has no width or height immediately.
  // If it becomes a performance issue, we can make childList === isSafari but thus far Sugar has no platform detection so that would be a sad day.
  observer.observe(Traverse.owner(element).dom(), { attributes: true, subtree: true, childList: true, attributeFilter: [ 'style', 'class' ]});

  return unbindMutate;
};

// IE11 and above, not using numerosity so we can poll on IE10
const wait = window.MutationObserver !== undefined && window.MutationObserver !== null ? mutate : poll;

const onShow = function (element: Element, f: () => void): () => void {
  if (Visibility.isVisible(element)) {
    Window.requestAnimationFrame(f);
    return Fun.noop;
  } else {
    // these events might come in thick and fast, so throttle them
    const throttler = Throttler.adaptable(function () {
      if (Visibility.isVisible(element)) {
        unbind();
        Window.requestAnimationFrame(f);
      }
    }, 100);

    const unbind = wait(element, throttler.throttle);

    return unbind;
  }
};

export { onShow };
