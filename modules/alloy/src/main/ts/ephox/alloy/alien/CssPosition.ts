import { Adt, Arr, Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { SugarPosition } from './TypeDefinitions';

export interface CssPositionAdt extends Adt { }

const adt: {
  screen: (point: SugarPosition) => CssPositionAdt;
  absolute: (point: SugarPosition, sx: number, sy: number) => CssPositionAdt;
} = Adt.generate([
  { screen: [ 'point' ] },
  { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
]);

const toFixed = (pos: CssPositionAdt): SugarPosition => {
  // TODO: Use new ADT methods
  return pos.fold(
    (point: SugarPosition) => point,
    (point: SugarPosition, scrollLeft: number, scrollTop: number) => point.translate(-scrollLeft, -scrollTop)
  );
};

const toAbsolute = (pos: CssPositionAdt): SugarPosition => {
  return pos.fold(
    (point: SugarPosition) => point,
    (point: SugarPosition, scrollLeft: number, scrollTop: number) => point
  );
};

const sum = (points: SugarPosition[]): SugarPosition => {
  return Arr.foldl(points, (b, a) => {
    return b.translate(a.left(), a.top());
  }, Position(0, 0));
};

const sumAsFixed = (positions: CssPositionAdt[]): SugarPosition => {
  const points = Arr.map(positions, toFixed);
  return sum(points);
};

const sumAsAbsolute = (positions: CssPositionAdt[]): SugarPosition => {
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