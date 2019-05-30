/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ClientRect, HTMLElement } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Element, SelectorFilter } from '@ephox/sugar';
import { findClosestHorizontalPosition, getLastLinePositions, getFirstLinePositions } from './LineReader';
import { CaretPosition } from './CaretPosition';
import { clone as roundRect } from '../geom/ClientRect';

type GetAxisValue = (rect: ClientRect) => number;
type IsTargetCorner = (corner: Corner, y: number) => boolean;

interface Corner {
  x: number;
  y: number;
  cell: HTMLElement;
}

const deflate = (rect: ClientRect, delta: number): ClientRect => {
  return {
    left: rect.left - delta,
    top: rect.top - delta,
    right: rect.right + delta * 2,
    bottom: rect.bottom + delta * 2,
    width: rect.width + delta,
    height: rect.height + delta
  };
};

const getCorners = (getYAxisValue, tds: HTMLElement[]): Corner[] => {
  return Arr.bind(tds, (td) => {
    const rect = deflate(roundRect(td.getBoundingClientRect()), -1);
    return [
      { x: rect.left, y: getYAxisValue(rect), cell: td },
      { x: rect.right, y: getYAxisValue(rect), cell: td }
    ];
  });
};

const findClosestCorner = (corners: Corner[], x: number, y: number): Option<Corner> => {
  return Arr.foldl(corners, (acc, newCorner) => {
    return acc.fold(
      () => Option.some(newCorner),
      (oldCorner) => {
        const oldDist = Math.sqrt(Math.abs(oldCorner.x - x) + Math.abs(oldCorner.y - y));
        const newDist = Math.sqrt(Math.abs(newCorner.x - x) + Math.abs(newCorner.y - y));
        return Option.some(newDist < oldDist ? newCorner : oldCorner);
      }
    );
  }, Option.none());
};

const getClosestCell = (getYAxisValue: GetAxisValue, isTargetCorner: IsTargetCorner, table: HTMLElement, x: number, y: number): Option<HTMLElement> => {
  const cells = SelectorFilter.descendants(Element.fromDom(table), 'td,th,caption').map((e) => e.dom());
  const corners = Arr.filter(getCorners(getYAxisValue, cells), (corner) => isTargetCorner(corner, y));

  return findClosestCorner(corners, x, y).map((corner) => {
    return corner.cell;
  });
};

const getBottomValue = (rect: ClientRect) => rect.bottom;
const getTopValue = (rect: ClientRect) => rect.top;
const isAbove = (corner: Corner, y: number) => corner.y < y;
const isBelow = (corner: Corner, y: number) => corner.y > y;

const getClosestCellAbove = Fun.curry(getClosestCell, getBottomValue, isAbove) as (table: HTMLElement, x: number, y: number) => Option<HTMLElement>;
const getClosestCellBelow = Fun.curry(getClosestCell, getTopValue, isBelow) as (table: HTMLElement, x: number, y: number) => Option<HTMLElement>;

const findClosestPositionInAboveCell = (table: HTMLElement, pos: CaretPosition): Option<CaretPosition> => {
  return Arr.head(pos.getClientRects()).bind((rect) => {
    return getClosestCellAbove(table, rect.left, rect.top);
  }).bind((cell) => findClosestHorizontalPosition(getLastLinePositions(cell), pos));
};

const findClosestPositionInBelowCell = (table: HTMLElement, pos: CaretPosition): Option<CaretPosition> => {
  return Arr.last(pos.getClientRects()).bind((rect) => {
    return getClosestCellBelow(table, rect.left, rect.top);
  }).bind((cell) => findClosestHorizontalPosition(getFirstLinePositions(cell), pos));
};

export {
  getClosestCellAbove,
  getClosestCellBelow,
  findClosestPositionInAboveCell,
  findClosestPositionInBelowCell
};
