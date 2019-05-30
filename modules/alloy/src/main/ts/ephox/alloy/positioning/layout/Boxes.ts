import { Element, Height, Scroll, Width } from '@ephox/sugar';

import * as OuterPosition from '../../frame/OuterPosition';
import { bounds, Bounds } from '../../alien/Boxes';
import { window, document } from '@ephox/dom-globals';

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
  absolute,
  win
};