import { Adt, Option } from '@ephox/katamari';

import * as OriginsUI from '../view/OriginsUI';
import * as Reposition from '../view/Reposition';
import * as Direction from './Direction';
import { AdtInterface } from 'ephox/alloy/alien/TypeDefinitions';

export interface Origins extends AdtInterface {
  // TODO
}

const adt = Adt.generate([
  { none: [ ] },
  { relative: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y', 'width', 'height' ] }
]);

const reposition = function (origin, decision) {
  return origin.fold(function () {
    return Reposition.css('absolute', Option.some(decision.x()), Option.some(decision.y()), Option.none(), Option.none());
  }, function (x, y) {
    return Reposition.css('absolute', Option.some(decision.x() - x), Option.some(decision.y() - y), Option.none(), Option.none());
  }, function (x, y, width, height) {
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
        return Reposition.css('fixed', left, top, none, none);
      },
      function () {
        // southwest
        return Reposition.css('fixed', none, top, right, none);
      },
      function () {
        // northeast
        return Reposition.css('fixed', left, none, none, bottom);
      },
      function () {
        // northwest
        return Reposition.css('fixed', none, none, right, bottom);
      }
    );
  });
};

const toBox = function (origin, element) {
  return OriginsUI.toBox(origin, element);
};

const viewport = function (origin, bounds) {
  return OriginsUI.viewport(origin, bounds);
};

const translate = function (origin, doc, x, y) {
  return OriginsUI.translate(origin, doc, x, y);
};

const cata = function (subject, onNone, onRelative, onFixed) {
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