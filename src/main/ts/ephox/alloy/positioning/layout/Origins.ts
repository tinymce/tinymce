import { Adt, Option } from '@ephox/katamari';

import * as OriginsUI from '../view/OriginsUI';
import * as Reposition from '../view/Reposition';
import * as Direction from './Direction';
import { AdtInterface } from '../../alien/TypeDefinitions';

export interface Origins extends AdtInterface {
  // TODO
}

const adt = Adt.generate([
  { none: [ ] },
  { relative: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y', 'width', 'height' ] }
]);

const reposition = (origin, decision) => {
  return origin.fold(() => {
    return Reposition.css('absolute', Option.some(decision.x()), Option.some(decision.y()), Option.none(), Option.none());
  }, (x, y) => {
    return Reposition.css('absolute', Option.some(decision.x() - x), Option.some(decision.y() - y), Option.none(), Option.none());
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
        return Reposition.css('fixed', left, top, none, none);
      },
      () => {
        // southwest
        return Reposition.css('fixed', none, top, right, none);
      },
      () => {
        // northeast
        return Reposition.css('fixed', left, none, none, bottom);
      },
      () => {
        // northwest
        return Reposition.css('fixed', none, none, right, bottom);
      }
    );
  });
};

const toBox = (origin, element) => {
  return OriginsUI.toBox(origin, element);
};

const viewport = (origin, bounds) => {
  return OriginsUI.viewport(origin, bounds);
};

const translate = (origin, doc, x, y) => {
  return OriginsUI.translate(origin, doc, x, y);
};

const cata = (subject, onNone, onRelative, onFixed) => {
  return subject.fold(onNone, onRelative, onFixed);
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