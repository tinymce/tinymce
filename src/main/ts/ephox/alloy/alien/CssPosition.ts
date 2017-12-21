import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Adt } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

var adt = Adt.generate([
  { screen: [ 'point' ] },
  { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
]);

var toFixed = function (pos) {
  // TODO: Use new ADT methods
  return pos.fold(
    Fun.identity,
    function (point, scrollLeft, scrollTop) {
      return point.translate(-scrollLeft, -scrollTop);
    }
  );
};

var toAbsolute = function (pos) {
  return pos.fold(
    Fun.identity,
    function (point, scrollLeft, scrollTop) {
      return point;
    }
  );
};

var sum = function (points) {
  return Arr.foldl(points, function (b, a) {
    return b.translate(a.left(), a.top());
  }, Position(0, 0));
};

var sumAsFixed = function (positions) {
  var points = Arr.map(positions, toFixed);
  return sum(points);
};

var sumAsAbsolute = function (positions) {
  var points = Arr.map(positions, toAbsolute);
  return sum(points);
};

export default <any> {
  sumAsFixed: sumAsFixed,
  sumAsAbsolute: sumAsAbsolute,
  screen: adt.screen,
  absolute: adt.absolute
};