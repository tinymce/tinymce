import { EventListenerOrEventListenerObject, Window, window } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
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
  /* tslint:disable-next-line:no-string-literal */
  const visualViewport = win['visualViewport'];
  if (visualViewport !== undefined) {
    // iOS doesn't update the pageTop/pageLeft when element.scrollIntoView() is called, so we need to fallback to the
    // scroll position which will always be less than the page top/left values when page top/left are accurate/correct.
    return bounds(Math.max(visualViewport.pageLeft, scroll.left()), Math.max(visualViewport.pageTop, scroll.top()), visualViewport.width, visualViewport.height);
  } else {
    const html = doc.documentElement;
    // Don't use window.innerWidth/innerHeight here, as we don't want to include scrollbars
    // since the right/bottom position is based on the edge of the scrollbar not the window
    const width = html.clientWidth;
    const height = html.clientHeight;
    return bounds(scroll.left(), scroll.top(), width, height);
  }
};

export {
  getBounds,
  VisualViewport
};
