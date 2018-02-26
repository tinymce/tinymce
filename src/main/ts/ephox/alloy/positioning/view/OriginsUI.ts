import { Fun } from '@ephox/katamari';
import { Height, Position, Scroll, Width } from '@ephox/sugar';

import * as OuterPosition from '../../frame/OuterPosition';
import Bounds from '../layout/Bounds';
import * as Boxes from '../layout/Boxes';

// Moved out of Origins so that Origins can be tested atomically
// if/when repartee is compiled with NPM modules available, we can switch to `domtest` which allows sugar to load in nodejs

const toBox = function (origin, element) {
  const rel = Fun.curry(OuterPosition.find, element);
  const position = origin.fold(rel, rel, function () {
    const scroll = Scroll.get();
    // TODO: Make adding the scroll in OuterPosition.find optional.
    return OuterPosition.find(element).translate(-scroll.left(), -scroll.top());
  });

  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return Bounds(position.left(), position.top(), width, height);
};

const viewport = function (origin, bounds) {
  return bounds.fold(function () {
    /* There are no bounds supplied */
    return origin.fold(Boxes.view, Boxes.view, Bounds);
  }, function (b) {
    /* Use any bounds supplied or make a bounds from the whole viewport for fixed. */
    return origin.fold(b, b, Bounds);
  });
};

const translate = function (origin, doc, x, y) {
  const pos = Position(x, y);
  return origin.fold(Fun.constant(pos), Fun.constant(pos), function () {
    const outerScroll = Scroll.get();
    return pos.translate(-outerScroll.left(), -outerScroll.top());
  });
};

export {
  toBox,
  viewport,
  translate
};