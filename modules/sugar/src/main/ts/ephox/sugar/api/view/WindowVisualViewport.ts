import { Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { fromRawEvent } from '../../impl/FilteredEvent';
import { EventHandler, EventUnbinder } from '../events/Types';
import { SugarElement } from '../node/SugarElement';
import * as Scroll from './Scroll';

export interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly right: number;
  readonly bottom: number;
}

const get = (_win?: Window): Optional<VisualViewport> => {
  const win = _win === undefined ? window : _win;
  if (PlatformDetection.detect().browser.isFirefox()) {
    // TINY-7984: Firefox 91 is returning incorrect values for visualViewport.pageTop, so disable it for now
    return Optional.none();
  } else {
    return Optional.from(win.visualViewport);
  }
};

const bounds = (x: number, y: number, width: number, height: number): Bounds => ({
  x,
  y,
  width,
  height,
  right: x + width,
  bottom: y + height
});

const getBounds = (_win?: Window): Bounds => {
  const win = _win === undefined ? window : _win;
  const doc = win.document;
  const scroll = Scroll.get(SugarElement.fromDom(doc));
  return get(win).fold(
    () => {
      const html = win.document.documentElement;
      // Don't use window.innerWidth/innerHeight here, as we don't want to include scrollbars
      // since the right/bottom position is based on the edge of the scrollbar not the window
      const width = html.clientWidth;
      const height = html.clientHeight;
      return bounds(scroll.left, scroll.top, width, height);
    },
    (visualViewport) =>
      // iOS doesn't update the pageTop/pageLeft when element.scrollIntoView() is called, so we need to fallback to the
      // scroll position which will always be less than the page top/left values when page top/left are accurate/correct.
      bounds(Math.max(visualViewport.pageLeft, scroll.left), Math.max(visualViewport.pageTop, scroll.top), visualViewport.width, visualViewport.height)

  );
};

const bind = (name: string, callback: EventHandler, _win?: Window): EventUnbinder =>
  get(_win).map((visualViewport) => {
    const handler = (e: Event) => callback(fromRawEvent(e));
    visualViewport.addEventListener(name, handler);

    return {
      unbind: () => visualViewport.removeEventListener(name, handler)
    };
  }).getOrThunk(() => ({
    unbind: Fun.noop
  }));

export {
  bind,
  get,
  getBounds
};
