import { Adt, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as OriginsUI from '../view/OriginsUI';
import { css as NuRepositionCss, RepositionCss, RepositionDecision} from '../view/Reposition';
import * as Direction from './Direction';
import { AdtInterface, SugarDocument, SugarPosition } from '../../alien/TypeDefinitions';
import { Bounds } from '../../alien/Boxes';

export interface OriginAdt extends AdtInterface {

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

  // wtb adt.match()
  return Direction.cata(decision.direction(),
    function () {
      // southeast
      return NuRepositionCss(posName, left, top, none, none);
    },
    function () {
      // southwest
      return NuRepositionCss(posName, none, top, right, none);
    },
    function () {
      // northeast
      return NuRepositionCss(posName, left, none, none, bottom);
    },
    function () {
      // northwest
      return NuRepositionCss(posName, none, none, right, bottom);
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

const toBox = (origin: OriginAdt, element: Element): Bounds => {
  return OriginsUI.toBox(origin, element);
};

const viewport = (origin: OriginAdt, getBounds: Option<() => Bounds>): Bounds => {
  return OriginsUI.viewport(origin, getBounds);
};

const translate = (origin, x, y) => {
  return OriginsUI.translate(origin, x, y);
};

const cata = <B>(
  subject: OriginAdt,
  onNone: () => B,
  onRelative: (x: number, y: number, width: number, height: number) => B,
  onFixed: (x: number, y: number, width: number, height: number) => B
): B => {
  return subject.fold<B>(onNone, onRelative, onFixed);
};

const none = adt.none as () => OriginAdt;
const relative = adt.relative as (x: number, y: number, width: number, height: number) => OriginAdt;
const fixed = adt.fixed as (x: number, y: number, width: number, height: number) => OriginAdt;

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