// eslint-disable-next-line max-len
import { Arr, Fun, Optional } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import * as ClientRect from '../geom/ClientRect';
import { CaretPosition } from './CaretPosition';
import { findClosestHorizontalPosition, getFirstLinePositions, getLastLinePositions } from './LineReader';

type GeomClientRect = ClientRect.ClientRect;

type GetAxisValue = (rect: GeomClientRect) => number;
type IsTargetCorner = (corner: Corner, y: number) => boolean;
type CellOrCaption = HTMLTableCellElement | HTMLTableCaptionElement;

interface Corner {
  readonly x: number;
  readonly y: number;
  readonly cell: CellOrCaption;
}

const deflate = (rect: GeomClientRect, delta: number): GeomClientRect => ({
  left: rect.left - delta,
  top: rect.top - delta,
  right: rect.right + delta * 2,
  bottom: rect.bottom + delta * 2,
  width: rect.width + delta,
  height: rect.height + delta
});

const getCorners = (getYAxisValue: GetAxisValue, tds: CellOrCaption[]): Corner[] => Arr.bind(tds, (td) => {
  const rect = deflate(ClientRect.clone(td.getBoundingClientRect()), -1);
  return [
    { x: rect.left, y: getYAxisValue(rect), cell: td },
    { x: rect.right, y: getYAxisValue(rect), cell: td }
  ];
});

const findClosestCorner = (corners: Corner[], x: number, y: number): Optional<Corner> =>
  Arr.foldl(corners, (acc, newCorner) => acc.fold(
    () => Optional.some(newCorner),
    (oldCorner) => {
      const oldDist = Math.sqrt(Math.abs(oldCorner.x - x) + Math.abs(oldCorner.y - y));
      const newDist = Math.sqrt(Math.abs(newCorner.x - x) + Math.abs(newCorner.y - y));
      return Optional.some(newDist < oldDist ? newCorner : oldCorner);
    }
  ), Optional.none());

const getClosestCell = (
  getYAxisValue: GetAxisValue,
  isTargetCorner: IsTargetCorner,
  table: HTMLElement,
  x: number,
  y: number
): Optional<CellOrCaption> => {
  const cells = SelectorFilter.descendants<CellOrCaption>(
    SugarElement.fromDom(table),
    'td,th,caption'
  ).map((e) => e.dom);
  const corners = Arr.filter(
    getCorners(getYAxisValue, cells),
    (corner) => isTargetCorner(corner, y)
  );

  return findClosestCorner(corners, x, y).map((corner) => corner.cell);
};

const getBottomValue = (rect: GeomClientRect) => rect.bottom;
const getTopValue = (rect: GeomClientRect) => rect.top;
const isAbove = (corner: Corner, y: number) => corner.y < y;
const isBelow = (corner: Corner, y: number) => corner.y > y;

const getClosestCellAbove: (table: HTMLElement, x: number, y: number) => Optional<CellOrCaption> = Fun.curry(getClosestCell, getBottomValue, isAbove);
const getClosestCellBelow: (table: HTMLElement, x: number, y: number) => Optional<CellOrCaption> = Fun.curry(getClosestCell, getTopValue, isBelow);

const findClosestPositionInAboveCell = (table: HTMLElement, pos: CaretPosition): Optional<CaretPosition> =>
  Arr.head(pos.getClientRects())
    .bind((rect) => getClosestCellAbove(table, rect.left, rect.top))
    .bind((cell) => findClosestHorizontalPosition(getLastLinePositions(cell), pos));

const findClosestPositionInBelowCell = (table: HTMLElement, pos: CaretPosition): Optional<CaretPosition> =>
  Arr.last(pos.getClientRects())
    .bind((rect) => getClosestCellBelow(table, rect.left, rect.top))
    .bind((cell) => findClosestHorizontalPosition(getFirstLinePositions(cell), pos));

export {
  getClosestCellAbove,
  getClosestCellBelow,
  findClosestPositionInAboveCell,
  findClosestPositionInBelowCell
};
