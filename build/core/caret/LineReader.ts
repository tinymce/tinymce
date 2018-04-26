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
import CaretFinder from 'tinymce/core/caret/CaretFinder';
import NodeType from 'tinymce/core/dom/NodeType';
import { isInSameBlock } from 'tinymce/core/caret/CaretUtils';

export enum BreakType {
  Br,
  Block,
  Wrap,
  Eol
}

export interface LineInfo {
  positions: CaretPosition[];
  breakType: BreakType;
  breakAt: Option<CaretPosition>;
}

type CheckerPredicate = typeof CaretPosition.isAbove | typeof CaretPosition.isBelow;
type LineInfoFinder = (scope: HTMLElement, start: CaretPosition) => LineInfo;
type CaretPositionsFinder = (scope: HTMLElement, start: CaretPosition) => CaretPosition[];

const flip = (direction: HDirection, positions: CaretPosition[]) => direction === HDirection.Backwards ? positions.reverse() : positions;

const walk = (direction: HDirection, caretWalker: CaretWalker, pos: CaretPosition): CaretPosition => {
  return direction === HDirection.Forwards ? caretWalker.next(pos) : caretWalker.prev(pos);
};

const getBreakType = (scope: HTMLElement, direction: HDirection, currentPos: CaretPosition, nextPos: CaretPosition): BreakType => {
  if (NodeType.isBr(nextPos.getNode(direction === HDirection.Forwards))) {
    return BreakType.Br;
  } else if (isInSameBlock(currentPos, nextPos) === false) {
    return BreakType.Block;
  } else {
    return BreakType.Wrap;
  }
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

    if (NodeType.isBr(nextPos.getNode(false))) {
      if (direction === HDirection.Forwards) {
        return { positions: flip(direction, positions).concat([nextPos]), breakType: BreakType.Br, breakAt: Option.some(nextPos) };
      } else {
        return { positions: flip(direction, positions), breakType: BreakType.Br, breakAt: Option.some(nextPos) };
      }
    }

    if (!nextPos.isVisible()) {
      currentPos = nextPos;
      continue;
    }

    if (predicate(currentPos, nextPos)) {
      const breakType = getBreakType(scope, direction, currentPos, nextPos);
      return { positions: flip(direction, positions), breakType, breakAt: Option.some(nextPos) };
    }

    positions.push(nextPos);
    currentPos = nextPos;
  }

  return { positions: flip(direction, positions), breakType: BreakType.Eol, breakAt: Option.none() };
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

const getPositionsUntilPreviousLine = Fun.curry(getPositionsUntil, CaretPosition.isAbove, -1) as LineInfoFinder;
const getPositionsUntilNextLine = Fun.curry(getPositionsUntil, CaretPosition.isBelow, 1) as LineInfoFinder;
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
