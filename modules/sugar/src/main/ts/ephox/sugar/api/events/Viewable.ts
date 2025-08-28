import { Fun, Throttler } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as Traverse from '../search/Traverse';
import * as Visibility from '../view/Visibility';

/*
 * Long term it's probably worth looking at using a single event per page the way Resize does.
 * This could get a bit slow with a lot of editors in a heavy page.
 *
 * It's a bit harder to manage, though, because visibility is a one-shot listener.
 */
const observe = (element: SugarElement<HTMLElement>, f: () => void): () => void => {
  const observer: MutationObserver = new window.MutationObserver(f);

  const unbindMutate = () => observer.disconnect();

  // childList is super expensive, but required on Safari where the iframe has no width or height immediately.
  // If it becomes a performance issue, we can make childList === isSafari but thus far Sugar has no platform detection so that would be a sad day.
  observer.observe(Traverse.owner(element).dom, { attributes: true, subtree: true, childList: true, attributeFilter: [ 'style', 'class' ] });

  return unbindMutate;
};

const onShow = (element: SugarElement<HTMLElement>, f: () => void): () => void => {
  if (Visibility.isVisible(element)) {
    window.requestAnimationFrame(f);
    return Fun.noop;
  } else {
    // these events might come in thick and fast, so throttle them
    const throttler = Throttler.adaptable(() => {
      if (Visibility.isVisible(element)) {
        unbind();
        window.requestAnimationFrame(f);
      }
    }, 100);

    const unbind = observe(element, throttler.throttle);

    return unbind;
  }
};

export { onShow };
