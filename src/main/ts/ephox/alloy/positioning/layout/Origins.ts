import { Adt, Option } from '@ephox/katamari';

import * as OriginsUI from '../view/OriginsUI';
import { css as NuRepositionCss, RepositionCss, RepositionDecision} from '../view/Reposition';
import * as Direction from './Direction';
import { AdtInterface, SugarElement, SugarDocument, SugarPosition } from '../../alien/TypeDefinitions';
import { Bounds } from '../../alien/Boxes';

export interface OriginAdt extends AdtInterface {

}

const adt = Adt.generate([
  { none: [ ] },
  { relative: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y', 'width', 'height' ] }
]);

const reposition = (origin: OriginAdt, decision: RepositionDecision): RepositionCss => {
  return origin.fold<RepositionCss>(() => {
    return NuRepositionCss('absolute', Option.some(decision.x()), Option.some(decision.y()), Option.none(), Option.none());
  }, (x, y) => {
    return NuRepositionCss('absolute', Option.some(decision.x() - x), Option.some(decision.y() - y), Option.none(), Option.none());
  }, (x, y, width, height) => {
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
      () => {
        // southeast
        return NuRepositionCss('fixed', left, top, none, none);
      },
      () => {
        // southwest
        return NuRepositionCss('fixed', none, top, right, none);
      },
      () => {
        // northeast
        return NuRepositionCss('fixed', left, none, none, bottom);
      },
      () => {
        // northwest
        return NuRepositionCss('fixed', none, none, right, bottom);
      }
    );
  });
};

const toBox = (origin: OriginAdt, element: SugarElement): Bounds => {
  return OriginsUI.toBox(origin, element);
};

const viewport = (origin: OriginAdt, bounds: Option<() => Bounds>): Bounds => {
  return OriginsUI.viewport(origin, bounds);
};

const translate = (origin: OriginAdt, doc: SugarDocument, x: number, y: number): SugarPosition => {
  return OriginsUI.translate(origin, doc, x, y);
};

const cata = <B>(
  subject: OriginAdt,
  onNone: () => B,
  onRelative: (x: number, y: number) => B,
  onFixed: (x: number, y: number, width: number, height: number) => B
): B => {
  return subject.fold<B>(onNone, onRelative, onFixed);
};

const none = adt.none as () => OriginAdt;
const relative = adt.relative as (x: number, y: number) => OriginAdt;
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