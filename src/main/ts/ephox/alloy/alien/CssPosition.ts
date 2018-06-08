import { Adt, Arr, Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { PositionCoordinates, AdtInterface } from './TypeDefinitions';

export interface CssPositionAdt extends AdtInterface { }

const adt = Adt.generate([
  { screen: [ 'point' ] },
  { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
]);

const toFixed = function (pos: CssPositionAdt): PositionCoordinates {
  // TODO: Use new ADT methods
  return pos.fold(
    (point: PositionCoordinates) => point,
    (point: PositionCoordinates, scrollLeft: number, scrollTop: number) => point.translate(-scrollLeft, -scrollTop)
  );
};

const toAbsolute = function (pos: CssPositionAdt): PositionCoordinates {
  return pos.fold(
    (point: PositionCoordinates) => point,
    (point: PositionCoordinates, scrollLeft: number, scrollTop: number) => point
  );
};

const sum = function (points: PositionCoordinates[]): PositionCoordinates {
  return Arr.foldl(points, function (b, a) {
    return b.translate(a.left(), a.top());
  }, Position(0, 0));
};

const sumAsFixed = function (positions: CssPositionAdt[]): PositionCoordinates {
  const points = Arr.map(positions, toFixed);
  return sum(points);
};

const sumAsAbsolute = function (positions: CssPositionAdt[]): PositionCoordinates {
  const points = Arr.map(positions, toAbsolute);
  return sum(points);
};

const screen: (point: PositionCoordinates) => CssPositionAdt = adt.screen;
const absolute: (point: PositionCoordinates, sx: number, sy: number) => CssPositionAdt = adt.absolute;

export {
  sumAsFixed,
  sumAsAbsolute,
  screen,
  absolute
};