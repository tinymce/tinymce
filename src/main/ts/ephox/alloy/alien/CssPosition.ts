import { Adt, Arr, Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { PositionCoordinates, AdtInterface } from './TypeDefinitions';

export interface CssPositionAdt extends AdtInterface {

}

const adt = Adt.generate([
  { screen: [ 'point' ] },
  { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
]);

const toFixed = function (pos) {
  // TODO: Use new ADT methods
  return pos.fold(
    Fun.identity,
    function (point, scrollLeft, scrollTop) {
      return point.translate(-scrollLeft, -scrollTop);
    }
  );
};

const toAbsolute = function (pos) {
  return pos.fold(
    Fun.identity,
    function (point, scrollLeft, scrollTop) {
      return point;
    }
  );
};

const sum = function (points: PositionCoordinates[]): PositionCoordinates {
  return Arr.foldl(points, function (b, a) {
    return b.translate(a.left(), a.top());
  }, Position(0, 0));
};

const sumAsFixed = function (positions: CssPositionAdt[]) {
  const points = Arr.map(positions, toFixed);
  return sum(points);
};

const sumAsAbsolute = function (positions: CssPositionAdt[]) {
  const points = Arr.map(positions, toAbsolute);
  return sum(points);
};

const screen = adt.screen;
const absolute = adt.absolute;

export {
  sumAsFixed,
  sumAsAbsolute,
  screen,
  absolute
};