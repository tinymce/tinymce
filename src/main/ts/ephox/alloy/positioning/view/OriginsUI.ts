import { Fun, Option } from '@ephox/katamari';
import { Height, Position, Scroll, Width, Element } from '@ephox/sugar';

import * as OuterPosition from '../../frame/OuterPosition';
import { Bounds, bounds } from '../../alien/Boxes';
import * as Boxes from '../layout/Boxes';
import { OriginAdt } from '../../positioning/layout/Origins';
import { SugarPosition, SugarDocument } from '../../alien/TypeDefinitions';

// Moved out of Origins so that Origins can be tested atomically
// if/when repartee is compiled with NPM modules available, we can switch to `domtest` which allows sugar to load in nodejs

const toBox = (origin: OriginAdt, element: Element): Bounds => {
  const pos = OuterPosition.find(element);
  const position = translate(origin, pos.left(), pos.top());

  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return bounds(position.left(), position.top(), width, height);
};

// TODO: Not sure about these bounds.
const viewport = (origin: OriginAdt, getBounds: Option<() => Bounds>): Bounds => {
  return getBounds.fold(() => {
    /* There are no bounds supplied */
    return origin.fold(Boxes.win, Boxes.win, bounds);
  }, (b) => {
    /* Use any bounds supplied or make a bounds from the whole viewport for fixed. */
    return origin.fold(b, b, bounds);
  });
};

const translate = (origin: OriginAdt, x: number, y: number): SugarPosition => {
  const pos = Position(x, y);
  const removeScroll = () => {
    const outerScroll = Scroll.get();
    return pos.translate(-outerScroll.left(), -outerScroll.top());
  };
  // This could use cata if it wasn't a circular reference
  return origin.fold(Fun.constant(pos), removeScroll, removeScroll);
};

export {
  toBox,
  viewport,
  translate
};