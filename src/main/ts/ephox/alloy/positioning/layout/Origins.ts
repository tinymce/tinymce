import Direction from './Direction';
import OriginsUI from '../view/OriginsUI';
import Reposition from '../view/Reposition';
import { Adt } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var adt = Adt.generate([
  { 'none': [ ] },
  { 'relative': [ 'x', 'y' ] },
  { 'fixed': [ 'x', 'y', 'width', 'height' ] }
]);

var reposition = function (origin, decision) {
  return origin.fold(function () {
    return Reposition.css('absolute', Option.some(decision.x()), Option.some(decision.y()), Option.none(), Option.none());
  }, function (x, y) {
    return Reposition.css('absolute', Option.some(decision.x() - x), Option.some(decision.y() - y), Option.none(), Option.none());
  }, function (x, y, width, height) {
    var decisionX = decision.x() - x;
    var decisionY = decision.y() - y;
    var decisionWidth = decision.width();
    var decisionHeight = decision.height();
    var decisionRight = width - (decisionX + decisionWidth);
    var decisionBottom = height - (decisionY + decisionHeight);

    var left = Option.some(decisionX);
    var top = Option.some(decisionY);
    var right = Option.some(decisionRight);
    var bottom = Option.some(decisionBottom);
    var none = Option.none();

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

var toBox = function (origin, element) {
  return OriginsUI.toBox(origin, element);
};

var viewport = function (origin, bounds) {
  return OriginsUI.viewport(origin, bounds);
};

var translate = function (origin, doc, x, y) {
  return OriginsUI.translate(origin, doc, x, y);
};

var cata = function (subject, onNone, onRelative, onFixed) {
  return subject.fold(onNone, onRelative, onFixed);
};

export default <any> {
  none: adt.none,
  relative: adt.relative,
  fixed: adt.fixed,
  reposition: reposition,
  viewport: viewport,
  toBox: toBox,
  translate: translate,
  cata: cata
};