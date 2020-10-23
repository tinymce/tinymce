/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// eslint-disable-next-line max-len
import { Arr, Fun, Optional } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';
import { clone as roundRect } from '../geom/ClientRect';
import { CaretPosition } from './CaretPosition';
import { findClosestHorizontalPosition, getFirstLinePositions, getLastLinePositions } from './LineReader';

type GetAxisValue = (rect: ClientRect) => number;
type IsTargetCorner = (corner: Corner, y: number) => boolean;

interface Corner {
  x: number;
  y: number;
  cell: HTMLElement;
}

const deflate = (rect: ClientRect, delta: number): ClientRect => ({
  left: rect.left - delta,
  top: rect.top - delta,
  right: rect.right + delta * 2,
  bottom: rect.bottom + delta * 2,
  width: rect.width + delta,
  height: rect.height + delta
});

const getCorners = (getYAxisValue, tds: HTMLElement[]): Corner[] => Arr.bind(tds, (td) => {
  const rect = deflate(roundRect(td.getBoundingClientRect()), -1);
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
): Optional<HTMLElement> => {
  type TableThing = HTMLTableDataCellElement | HTMLTableHeaderCellElement | HTMLTableCaptionElement;
  const cells = SelectorFilter.descendants<TableThing>(
    SugarElement.fromDom(table),
    'td,th,caption'
  ).map((e) => e.dom);
  const corners = Arr.filter(
    getCorners(getYAxisValue, cells),
    (corner) => isTargetCorner(corner, y)
  );

  return findClosestCorner(corners, x, y).map((corner) => corner.cell);
};

const getBottomValue = (rect: ClientRect) => rect.bottom;
const getTopValue = (rect: ClientRect) => rect.top;
const isAbove = (corner: Corner, y: number) => corner.y < y;
const isBelow = (corner: Corner, y: number) => corner.y > y;

const getClosestCellAbove = Fun.curry(getClosestCell, getBottomValue, isAbove);
const getClosestCellBelow = Fun.curry(getClosestCell, getTopValue, isBelow);

const findClosestPositionInAboveCell = (table: HTMLElement, pos: CaretPosition): Optional<CaretPosition> =>
  Arr.head(pos.getClientRects()).
    bind((rect) => getClosestCellAbove(table, rect.left, rect.top)).
    bind((cell) => findClosestHorizontalPosition(getLastLinePositions(cell), pos));

const findClosestPositionInBelowCell = (table: HTMLElement, pos: CaretPosition): Optional<CaretPosition> =>
  Arr.last(pos.getClientRects()).
    bind((rect) => getClosestCellBelow(table, rect.left, rect.top)).
    bind((cell) => findClosestHorizontalPosition(getFirstLinePositions(cell), pos));

export {
  getClosestCellAbove,
  getClosestCellBelow,
  findClosestPositionInAboveCell,
  findClosestPositionInBelowCell
};
