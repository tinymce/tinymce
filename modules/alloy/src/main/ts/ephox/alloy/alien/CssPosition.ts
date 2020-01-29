import { Adt, Arr, Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

export interface CssPositionAdt {
  fold: <T> (
    screen: (point: Position) => T,
    absolute: (point: Position, sx: number, sy: number) => T
  ) => T;
  match: <T> (branches: {
    screen: (point: Position) => T,
    absolute: (point: Position, sx: number, sy: number) => T
  }) => T;
  log: (label: string) => void;
}

const adt: {
  screen: (point: Position) => CssPositionAdt;
  absolute: (point: Position, sx: number, sy: number) => CssPositionAdt;
} = Adt.generate([
  { screen: [ 'point' ] },
  { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
]);

const toFixed = (pos: CssPositionAdt): Position => {
  // TODO: Use new ADT methods
  return pos.fold(
    Fun.identity,
    (point, scrollLeft, scrollTop) => point.translate(-scrollLeft, -scrollTop)
  );
};

const toAbsolute = (pos: CssPositionAdt): Position => {
  return pos.fold(Fun.identity, Fun.identity);
};

const sum = (points: Position[]): Position => {
  return Arr.foldl(points, (b, a) => {
    return b.translate(a.left(), a.top());
  }, Position(0, 0));
};

const sumAsFixed = (positions: CssPositionAdt[]): Position => {
  const points = Arr.map(positions, toFixed);
  return sum(points);
};

const sumAsAbsolute = (positions: CssPositionAdt[]): Position => {
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
