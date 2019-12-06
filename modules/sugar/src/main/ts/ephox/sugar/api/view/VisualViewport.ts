import { Event, EventListenerOrEventListenerObject, Window, window } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { fromRawEvent } from '../../impl/FilteredEvent';
import { EventHandler } from '../events/Types';
import Element from '../node/Element';
import * as Scroll from './Scroll';

export interface Bounds {
  x: () => number;
  y: () => number;
  width: () => number;
  height: () => number;
  right: () => number;
  bottom: () => number;
}

// Experimental support for visual viewport
type VisualViewport = {
  offsetLeft: number,
  offsetTop: number,
  pageLeft: number,
  pageTop: number,
  width: number,
  height: number,
  scale: number,
  addEventListener: (event: string, handler: EventListenerOrEventListenerObject) => void,
  removeEventListener: (event: string, handler: EventListenerOrEventListenerObject) => void
};

const get = (_win?: Window): Option<VisualViewport> => {
  const win = _win === undefined ? window : _win;
  /* tslint:disable-next-line:no-string-literal */
  return Option.from(win['visualViewport']);
};

const bounds = (x: number, y: number, width: number, height: number): Bounds => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y),
    width: Fun.constant(width),
    height: Fun.constant(height),
    right: Fun.constant(x + width),
    bottom: Fun.constant(y + height)
  };
};

const getBounds = (_win?: Window): Bounds => {
  const win = _win === undefined ? window : _win;
  const doc = win.document;
  const scroll = Scroll.get(Element.fromDom(doc));
  return get(win).fold(
    () => {
      const html = win.document.documentElement;
      // Don't use window.innerWidth/innerHeight here, as we don't want to include scrollbars
      // since the right/bottom position is based on the edge of the scrollbar not the window
      const width = html.clientWidth;
      const height = html.clientHeight;
      return bounds(scroll.left(), scroll.top(), width, height);
    },
    (visualViewport) => {
      // iOS doesn't update the pageTop/pageLeft when element.scrollIntoView() is called, so we need to fallback to the
      // scroll position which will always be less than the page top/left values when page top/left are accurate/correct.
      return bounds(Math.max(visualViewport.pageLeft, scroll.left()), Math.max(visualViewport.pageTop, scroll.top()), visualViewport.width, visualViewport.height);
    }
  );
};

const bind = (name: string, callback: EventHandler, _win?: Window) => {
  return get(_win).map((visualViewport) => {
    const handler = (e: Event) => fromRawEvent(e);
    visualViewport.addEventListener(name, handler);

    return {
      unbind: () => visualViewport.removeEventListener(name, handler)
    };
  }).getOrThunk(() => {
    return {
      unbind: Fun.noop
    };
  });
};

export {
  bind,
  get,
  getBounds,
  VisualViewport
};
