/**
 * LineReader.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { CaretPosition } from './CaretPosition';
import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { HDirection, CaretWalker } from 'tinymce/core/caret/CaretWalker';
import * as ClientRect from 'tinymce/core/geom/ClientRect';
import CaretFinder from 'tinymce/core/caret/CaretFinder';

export interface LineInfo {
  positions: CaretPosition[];
  breakAt: Option<CaretPosition>;
}

type CheckerPredicate = typeof isAbove | typeof isBelow;
type LineInfoFinder = (scope: HTMLElement, start: CaretPosition) => LineInfo;
type CaretPositionsFinder = (scope: HTMLElement, start: CaretPosition) => CaretPosition[];

const isAbove = (pos1: CaretPosition, pos2: CaretPosition): boolean => {
  return Options.liftN([Arr.head(pos2.getClientRects()), Arr.last(pos1.getClientRects())], ClientRect.isAbove).getOr(false);
};

const isBelow = (pos1: CaretPosition, pos2: CaretPosition): boolean => {
  return Options.liftN([Arr.last(pos2.getClientRects()), Arr.head(pos1.getClientRects())], (r1, r2) => ClientRect.isBelow(r1, r2)).getOr(false);
};

const flip = (direction: HDirection, positions: CaretPosition[]) => direction === HDirection.Backwards ? positions.reverse() : positions;

const walk = (direction: HDirection, caretWalker: CaretWalker, pos: CaretPosition): CaretPosition => {
  return direction === HDirection.Forwards ? caretWalker.next(pos) : caretWalker.prev(pos);
};

const getPositionsUntil = (predicate: CheckerPredicate, direction: HDirection, scope: HTMLElement, start: CaretPosition): LineInfo => {
  const caretWalker = CaretWalker(scope);
  let currentPos = start, nextPos: CaretPosition;
  const positions: CaretPosition[] = [];

  while (currentPos) {
    nextPos = walk(direction, caretWalker, currentPos);

    if (!nextPos) {
      break;
    }

    if (!nextPos.isVisible()) {
      currentPos = nextPos;
      continue;
    }

    if (predicate(currentPos, nextPos)) {
      return { positions: flip(direction, positions), breakAt: Option.some(nextPos) };
    }

    positions.push(nextPos);
    currentPos = nextPos;
  }

  return { positions: flip(direction, positions), breakAt: Option.none() };
};

const getAdjacentLinePositions = (direction: HDirection, getPositionsUntilBreak: LineInfoFinder, scope: HTMLElement, start: CaretPosition): CaretPosition[] => {
  return getPositionsUntilBreak(scope, start).breakAt.map((pos) => {
    const positions = getPositionsUntilBreak(scope, pos).positions;
    return direction === HDirection.Backwards ? positions.concat(pos) : [pos].concat(positions);
  }).getOr([]);
};

const findClosestHorizontalPositionFromPoint = (positions: CaretPosition[], x: number): Option<CaretPosition> => {
  return Arr.foldl(positions, (acc, newPos) => {
    return acc.fold(
      () => Option.some(newPos),
      (lastPos) => {
        return Options.liftN([Arr.head(lastPos.getClientRects()), Arr.head(newPos.getClientRects())], (lastRect, newRect) => {
          const lastDist = Math.abs(x - lastRect.left);
          const newDist = Math.abs(x - newRect.left);
          return newDist <= lastDist ? newPos : lastPos;
        }).or(acc);
      }
    );
  }, Option.none());
};

const findClosestHorizontalPosition = (positions: CaretPosition[], pos: CaretPosition): Option<CaretPosition> => {
  return Arr.head(pos.getClientRects()).bind((targetRect) => {
    return findClosestHorizontalPositionFromPoint(positions, targetRect.left);
  });
};

const getPositionsUntilPreviousLine = Fun.curry(getPositionsUntil, isAbove, -1) as LineInfoFinder;
const getPositionsUntilNextLine = Fun.curry(getPositionsUntil, isBelow, 1) as LineInfoFinder;
const isAtFirstLine = (scope: HTMLElement, pos: CaretPosition) => getPositionsUntilPreviousLine(scope, pos).breakAt.isNone();
const isAtLastLine = (scope: HTMLElement, pos: CaretPosition) => getPositionsUntilNextLine(scope, pos).breakAt.isNone();
const getPositionsAbove = Fun.curry(getAdjacentLinePositions, -1, getPositionsUntilPreviousLine) as CaretPositionsFinder;
const getPositionsBelow = Fun.curry(getAdjacentLinePositions, 1, getPositionsUntilNextLine) as CaretPositionsFinder;

const getFirstLinePositions = (scope: HTMLElement) => CaretFinder.firstPositionIn(scope).map((pos) => {
  return [pos].concat(getPositionsUntilNextLine(scope, pos).positions);
}).getOr([]);

const getLastLinePositions = (scope: HTMLElement) => CaretFinder.lastPositionIn(scope).map((pos) => {
  return getPositionsUntilPreviousLine(scope, pos).positions.concat(pos);
}).getOr([]);

const getClosestPositionAbove = (scope: HTMLElement, pos: CaretPosition): Option<CaretPosition> => {
  return findClosestHorizontalPosition(getPositionsAbove(scope, pos), pos);
};

const getClosestPositionBelow = (scope: HTMLElement, pos: CaretPosition): Option<CaretPosition> => {
  return findClosestHorizontalPosition(getPositionsBelow(scope, pos), pos);
};

export {
  getPositionsUntilPreviousLine,
  getPositionsUntilNextLine,
  isAtFirstLine,
  isAtLastLine,
  getPositionsAbove,
  getPositionsBelow,
  findClosestHorizontalPosition,
  findClosestHorizontalPositionFromPoint,
  getFirstLinePositions,
  getLastLinePositions,
  getClosestPositionAbove,
  getClosestPositionBelow
};
