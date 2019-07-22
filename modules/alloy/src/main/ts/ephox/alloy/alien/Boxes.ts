import { document, window } from '@ephox/dom-globals';
import { Fun, Struct } from '@ephox/katamari';
import { Height, Location, Width, Element, Scroll } from '@ephox/sugar';

import { CssPositionAdt } from './CssPosition';
import * as OuterPosition from '../frame/OuterPosition';

const pointed = Struct.immutable('point', 'width', 'height') as (point: CssPositionAdt, width: number, height: number) => BoxByPoint;
const rect = Struct.immutable('x', 'y', 'width', 'height');

export interface Bounds {
  x: () => number;
  y: () => number;
  width: () => number;
  height: () => number;
  right: () => number;
  bottom: () => number;
}

export interface BoxByPoint {
  point: () => CssPositionAdt;
  width: () => number;
  height: () => number;
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

const box = (element: Element): Bounds => {
  const xy = Location.absolute(element);
  const w = Width.getOuter(element);
  const h = Height.getOuter(element);
  return bounds(xy.left(), xy.top(), w, h);
};

// NOTE: We used to use AriaFocus.preserve here, but there is no reason to do that now that
// we are not changing the visibility of the element. Hopefully (2015-09-29).
const absolute = (element: Element): Bounds => {
  const position = OuterPosition.find(element);
  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return bounds(position.left(), position.top(), width, height);
};

const win = (): Bounds => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const doc = Element.fromDom(document);
  const scroll = Scroll.get(doc);
  return bounds(scroll.left(), scroll.top(), width, height);
};

export {
  pointed,
  rect,
  bounds,
  box,
  absolute,
  win
};
