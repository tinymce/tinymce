import { Element, Height, Scroll, Width } from '@ephox/sugar';

import * as OuterPosition from '../../frame/OuterPosition';
import Bounds from './Bounds';
import { window, document } from '@ephox/dom-globals';

// NOTE: We used to use AriaFocus.preserve here, but there is no reason to do that now that
// we are not changing the visibility of the element. Hopefully (2015-09-29).
const absolute = function (element) {
  const position = OuterPosition.find(element);
  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return Bounds(position.left(), position.top(), width, height);
};

const view = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const doc = Element.fromDom(document);
  const scroll = Scroll.get(doc);
  return Bounds(scroll.left(), scroll.top(), width, height);
};

export {
  absolute,
  view
};