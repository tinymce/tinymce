import { Adt, Fun, Optional } from '@ephox/katamari';
import { Height, Scroll, SugarElement, SugarPosition, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OuterPosition from '../../frame/OuterPosition';
import { NuPositionCss, PositionCss } from '../view/PositionCss';
import { RepositionDecision } from '../view/Reposition';
import * as Direction from './Direction';

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
  const decisionRect = decision.rect;
  const decisionX = decisionRect.x - x;
  const decisionY = decisionRect.y - y;
  const decisionWidth = decisionRect.width;
  const decisionHeight = decisionRect.height;
  const decisionRight = width - (decisionX + decisionWidth);
  const decisionBottom = height - (decisionY + decisionHeight);

  const left = Optional.some(decisionX);
  const top = Optional.some(decisionY);
  const right = Optional.some(decisionRight);
  const bottom = Optional.some(decisionBottom);
  const none = Optional.none<number>();

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

const reposition = (origin: OriginAdt, decision: RepositionDecision): PositionCss => origin.fold(() => {
  const decisionRect = decision.rect;
  return NuPositionCss('absolute', Optional.some(decisionRect.x), Optional.some(decisionRect.y), Optional.none(), Optional.none());
}, (x, y, width, height) => {
  return positionWithDirection('absolute', decision, x, y, width, height);
}, (x, y, width, height) => {
  return positionWithDirection('fixed', decision, x, y, width, height);
});

const toBox = (origin: OriginAdt, element: SugarElement<HTMLElement>): Boxes.Bounds => {
  const rel = Fun.curry(OuterPosition.find, element);
  const position = origin.fold(rel, rel, () => {
    const scroll = Scroll.get();
    // TODO: Make adding the scroll in OuterPosition.find optional.
    return OuterPosition.find(element).translate(-scroll.left, -scroll.top);
  });

  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return Boxes.bounds(position.left, position.top, width, height);
};

const viewport = (origin: OriginAdt, optBounds: Optional<Boxes.Bounds>): Boxes.Bounds => optBounds.fold(
  /* There are no bounds supplied */
  () => origin.fold(Boxes.win, Boxes.win, Boxes.bounds),
  (bounds) =>
    /* Use any bounds supplied or remove the scroll position of the bounds for fixed. */
    origin.fold(
      Fun.constant(bounds),
      Fun.constant(bounds),
      () => {
        const pos = translate(origin, bounds.x, bounds.y);
        return Boxes.bounds(pos.left, pos.top, bounds.width, bounds.height);
      }
    )
);

const translate = (origin: OriginAdt, x: number, y: number): SugarPosition => {
  const pos = SugarPosition(x, y);
  const removeScroll = () => {
    const outerScroll = Scroll.get();
    return pos.translate(-outerScroll.left, -outerScroll.top);
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
