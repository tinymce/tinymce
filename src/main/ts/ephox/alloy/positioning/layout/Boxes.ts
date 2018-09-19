import { Element, Height, Scroll, Width } from '@ephox/sugar';

import * as OuterPosition from '../../frame/OuterPosition';
import { bounds, Bounds } from '../../alien/Boxes';
import { window } from '@ephox/dom-globals';

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
  // To make calculations easier, relative coordinates for "in view" positioning are transformed as if there was no scroll.
  // As such, Boxes.view() has to start at (0, 0).
  // Fixed positioning doesn't use Boxes.view() so it shouldn't require adjustment if it's used later.
  return bounds(0, 0, width, height);
};

export {
  absolute,
  win
};