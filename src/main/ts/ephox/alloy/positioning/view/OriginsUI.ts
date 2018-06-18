import { Fun, Option } from '@ephox/katamari';
import { Height, Position, Scroll, Width } from '@ephox/sugar';

import * as OuterPosition from '../../frame/OuterPosition';
import { Bounds, bounds } from '../../alien/Boxes';
import * as Boxes from '../layout/Boxes';
import { OriginAdt } from 'ephox/alloy/positioning/layout/Origins';
import { SugarElement, SugarPosition, SugarDocument } from 'ephox/alloy/alien/TypeDefinitions';

// Moved out of Origins so that Origins can be tested atomically
// if/when repartee is compiled with NPM modules available, we can switch to `domtest` which allows sugar to load in nodejs

const toBox = (origin: OriginAdt, element: SugarElement): Bounds => {
  const rel = Fun.curry(OuterPosition.find, element);
  const position = origin.fold(rel, rel, () => {
    const scroll = Scroll.get();
    // TODO: Make adding the scroll in OuterPosition.find optional.
    return OuterPosition.find(element).translate(-scroll.left(), -scroll.top());
  });

  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return bounds(position.left(), position.top(), width, height);
};

// TODO: Not sure about these bounds.
const viewport = (origin: OriginAdt, bs: Option<() => Bounds>): Bounds => {
  return bs.fold(() => {
    /* There are no bounds supplied */
    return origin.fold(Boxes.view, Boxes.view, bounds);
  }, (b) => {
    /* Use any bounds supplied or make a bounds from the whole viewport for fixed. */
    return origin.fold(b, b, bounds);
  });
};

const translate = (origin: OriginAdt, doc: SugarDocument, x: number, y: number): SugarPosition => {
  const pos = Position(x, y);
  return origin.fold(Fun.constant(pos), Fun.constant(pos), () => {
    const outerScroll = Scroll.get();
    return pos.translate(-outerScroll.left(), -outerScroll.top());
  });
};

export {
  toBox,
  viewport,
  translate
};