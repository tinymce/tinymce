import { Window, window } from '@ephox/dom-globals';
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
  /* tslint:disable-next-line:no-string-literal */
  const visualViewport = win['visualViewport'];
  if (visualViewport !== undefined) {
    return bounds(visualViewport.pageLeft, visualViewport.pageTop, visualViewport.width, visualViewport.height);
  } else {
    const doc = Element.fromDom(win.document);
    const scroll = Scroll.get(doc);
    const width = win.innerWidth;
    const height = win.innerHeight;
    return bounds(scroll.left(), scroll.top(), width, height);
  }
};

export {
  getBounds
};
