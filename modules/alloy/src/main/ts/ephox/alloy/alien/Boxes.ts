import { Height, SugarElement, SugarLocation, Width, WindowVisualViewport } from '@ephox/sugar';
import * as OuterPosition from '../frame/OuterPosition';

import { CssPositionAdt } from './CssPosition';

const pointed = (point: CssPositionAdt, width: number, height: number): BoxByPoint => ({
  point,
  width,
  height
});

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height
});

export interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly right: number;
  readonly bottom: number;
}

export interface BoxByPoint {
  readonly point: CssPositionAdt;
  readonly width: number;
  readonly height: number;
}

const bounds = (x: number, y: number, width: number, height: number): Bounds => ({
  x,
  y,
  width,
  height,
  right: x + width,
  bottom: y + height
});

const box = (element: SugarElement): Bounds => {
  const xy = SugarLocation.absolute(element);
  const w = Width.getOuter(element);
  const h = Height.getOuter(element);
  return bounds(xy.left, xy.top, w, h);
};

// NOTE: We used to use AriaFocus.preserve here, but there is no reason to do that now that
// we are not changing the visibility of the element. Hopefully (2015-09-29).
const absolute = (element: SugarElement): Bounds => {
  const position = OuterPosition.find(element);
  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return bounds(position.left, position.top, width, height);
};

const win = (): Bounds => WindowVisualViewport.getBounds(window);

export {
  pointed,
  rect,
  bounds,
  box,
  absolute,
  win
};
