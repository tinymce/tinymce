import { Adt, Fun, Option } from '@ephox/katamari';
import { Element, Height, Position, Scroll, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OuterPosition from '../../frame/OuterPosition';
import { RepositionDecision } from '../view/Reposition';
import * as Direction from './Direction';
import { PositionCss, NuPositionCss } from '../view/PositionCss';

type NoneOrigin<T> = () => T;
type RelativeOrigin<T> = (x: number, y: number, width: number, height: number) => T;
type FixedOrigin<T> = (x: number, y: number, width: number, height: number) => T;

export interface OriginAdt {
  fold: <T>(
    none: NoneOrigin<T>,
    relative: RelativeOrigin<T>,
    fixed: FixedOrigin<T>
  ) => T;
  match: <T>(branches: {
    none: NoneOrigin<T>;
    relative: RelativeOrigin<T>;
    fixed: FixedOrigin<T>;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  none: NoneOrigin<OriginAdt>;
  relative: RelativeOrigin<OriginAdt>;
  fixed: FixedOrigin<OriginAdt>;
} = Adt.generate([
  { none: [ ] },
  { relative: [ 'x', 'y', 'width', 'height' ] },
  { fixed: [ 'x', 'y', 'width', 'height' ] }
]);

const positionWithDirection = (posName: string, decision: RepositionDecision, x: number, y: number, width: number, height: number) => {
  const decisionX = decision.x - x;
  const decisionY = decision.y - y;
  const decisionWidth = decision.width;
  const decisionHeight = decision.height;
  const decisionRight = width - (decisionX + decisionWidth);
  const decisionBottom = height - (decisionY + decisionHeight);

  const left = Option.some(decisionX);
  const top = Option.some(decisionY);
  const right = Option.some(decisionRight);
  const bottom = Option.some(decisionBottom);
  const none = Option.none<number>();

  return Direction.cata(decision.direction,
    () => NuPositionCss(posName, left, top, none, none), // southeast
    () => NuPositionCss(posName, none, top, right, none), // southwest
    () => NuPositionCss(posName, left, none, none, bottom), // northeast
    () => NuPositionCss(posName, none, none, right, bottom), // northwest
    () => NuPositionCss(posName, left, top, none, none), // south
    () => NuPositionCss(posName, left, none, none, bottom), // north
    () => NuPositionCss(posName, left, top, none, none), // east
    () => NuPositionCss(posName, none, top, right, none) // west
  );
};

const reposition = (origin: OriginAdt, decision: RepositionDecision): PositionCss => origin.fold(function () {
  return NuPositionCss('absolute', Option.some(decision.x), Option.some(decision.y), Option.none(), Option.none());
}, function (x, y, width, height) {
  return positionWithDirection('absolute', decision, x, y, width, height);
}, function (x, y, width, height) {
  return positionWithDirection('fixed', decision, x, y, width, height);
});

const toBox = (origin: OriginAdt, element: Element): Boxes.Bounds => {
  const rel = Fun.curry(OuterPosition.find, element);
  const position = origin.fold(rel, rel, () => {
    const scroll = Scroll.get();
    // TODO: Make adding the scroll in OuterPosition.find optional.
    return OuterPosition.find(element).translate(-scroll.left(), -scroll.top());
  });

  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return Boxes.bounds(position.left(), position.top(), width, height);
};

const viewport = (origin: OriginAdt, getBounds: Option<() => Boxes.Bounds>): Boxes.Bounds => getBounds.fold(() =>
/* There are no bounds supplied */
  origin.fold(Boxes.win, Boxes.win, Boxes.bounds)
, (b) =>
/* Use any bounds supplied or remove the scroll position of the bounds for fixed. */
  origin.fold(b, b, () => {
    const bounds = b();
    const pos = translate(origin, bounds.x, bounds.y);
    return Boxes.bounds(pos.left(), pos.top(), bounds.width, bounds.height);
  })
);

const translate = (origin: OriginAdt, x: number, y: number): Position => {
  const pos = Position(x, y);
  const removeScroll = () => {
    const outerScroll = Scroll.get();
    return pos.translate(-outerScroll.left(), -outerScroll.top());
  };
  // This could use cata if it wasn't a circular reference
  return origin.fold(Fun.constant(pos), Fun.constant(pos), removeScroll);
};

const cata = <B>(
  subject: OriginAdt,
  onNone: NoneOrigin<B>,
  onRelative: RelativeOrigin<B>,
  onFixed: FixedOrigin<B>
): B => subject.fold<B>(onNone, onRelative, onFixed);

const none = adt.none;
const relative = adt.relative;
const fixed = adt.fixed;

export {
  none,
  relative,
  fixed,
  reposition,
  viewport,
  toBox,
  translate,
  cata
};
