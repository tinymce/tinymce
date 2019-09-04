import { Adt, Option, Fun } from '@ephox/katamari';
import { Element, Position, Scroll, Width, Height } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { css as NuRepositionCss, RepositionCss, RepositionDecision} from '../view/Reposition';
import * as Direction from './Direction';
import * as OuterPosition from '../../frame/OuterPosition';

export interface OriginAdt extends Adt {

}

const adt: {
  none: () => OriginAdt;
  relative: (x: number, y: number, width: number, height: number) => OriginAdt;
  fixed: (x: number, y: number, width: number, height: number) => OriginAdt;
} = Adt.generate([
  { none: [ ] },
  { relative: [ 'x', 'y', 'width', 'height' ] },
  { fixed: [ 'x', 'y', 'width', 'height' ] }
]);

const positionWithDirection = (posName, decision, x, y, width, height) => {
  const decisionX = decision.x() - x;
  const decisionY = decision.y() - y;
  const decisionWidth = decision.width();
  const decisionHeight = decision.height();
  const decisionRight = width - (decisionX + decisionWidth);
  const decisionBottom = height - (decisionY + decisionHeight);

  const left = Option.some(decisionX);
  const top = Option.some(decisionY);
  const right = Option.some(decisionRight);
  const bottom = Option.some(decisionBottom);
  const none = Option.none();

  return Direction.cata(decision.direction(),
    () => {
      // southeast
      return NuRepositionCss(posName, left, top, none, none);
    },
    () => {
      // southwest
      return NuRepositionCss(posName, none, top, right, none);
    },
    () => {
      // northeast
      return NuRepositionCss(posName, left, none, none, bottom);
    },
    () => {
      // northwest
      return NuRepositionCss(posName, none, none, right, bottom);
    },
    () => {
      // south
      return NuRepositionCss(posName, left, top, none, none);
    },
    () => {
      // north
      return NuRepositionCss(posName, left, none, none, bottom);
    },
    () => {
      // east
      return NuRepositionCss(posName, left, top, none, none);
    },
    () => {
      // west
      return NuRepositionCss(posName, none, top, right, none);
    }
  );
};

const reposition = (origin: OriginAdt, decision: RepositionDecision): RepositionCss => {
  return origin.fold(function () {
    return NuRepositionCss('absolute', Option.some(decision.x()), Option.some(decision.y()), Option.none(), Option.none());
  }, function (x, y, width, height) {
    return positionWithDirection('absolute', decision, x, y, width, height);
  }, function (x, y, width, height) {
    return positionWithDirection('fixed', decision, x, y, width, height);
  });
};

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

const viewport = (origin: OriginAdt, getBounds: Option<() => Boxes.Bounds>): Boxes.Bounds => {
  return getBounds.fold(() => {
    /* There are no bounds supplied */
    return origin.fold(Boxes.win, Boxes.win, Boxes.bounds);
  }, (b) => {
    /* Use any bounds supplied or remove the scroll position of the bounds for fixed. */
    return origin.fold(b, b, () => {
      const bounds = b();
      const pos = translate(origin, bounds.x(), bounds.y());
      return Boxes.bounds(pos.left(), pos.top(), bounds.width(), bounds.height());
    });
  });
};

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
  onNone: () => B,
  onRelative: (x: number, y: number, width: number, height: number) => B,
  onFixed: (x: number, y: number, width: number, height: number) => B
): B => {
  return subject.fold<B>(onNone, onRelative, onFixed);
};

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
