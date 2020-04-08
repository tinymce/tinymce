/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { CaretPosition } from './CaretPosition';
import { HDirection, CaretWalker } from './CaretWalker';
import * as CaretFinder from './CaretFinder';
import * as NodeType from '../dom/NodeType';
import { isInSameBlock } from './CaretUtils';

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

const flip = (direction: HDirection, positions: CaretPosition[]): CaretPosition[] =>
  direction === HDirection.Backwards ? Arr.reverse(positions) : positions;

const walk = (direction: HDirection, caretWalker: CaretWalker, pos: CaretPosition): CaretPosition => direction === HDirection.Forwards ? caretWalker.next(pos) : caretWalker.prev(pos);

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
        return { positions: flip(direction, positions).concat([ nextPos ]), breakType: BreakType.Br, breakAt: Option.some(nextPos) };
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

const getAdjacentLinePositions = (direction: HDirection, getPositionsUntilBreak: LineInfoFinder, scope: HTMLElement, start: CaretPosition): CaretPosition[] => getPositionsUntilBreak(scope, start).breakAt.map((pos) => {
  const positions = getPositionsUntilBreak(scope, pos).positions;
  return direction === HDirection.Backwards ? positions.concat(pos) : [ pos ].concat(positions);
}).getOr([]);

const findClosestHorizontalPositionFromPoint = (positions: CaretPosition[], x: number): Option<CaretPosition> => Arr.foldl(positions, (acc, newPos) => acc.fold(
  () => Option.some(newPos),
  (lastPos) => Options.lift2(Arr.head(lastPos.getClientRects()), Arr.head(newPos.getClientRects()), (lastRect, newRect) => {
    const lastDist = Math.abs(x - lastRect.left);
    const newDist = Math.abs(x - newRect.left);
    return newDist <= lastDist ? newPos : lastPos;
  }).or(acc)
), Option.none());

const findClosestHorizontalPosition = (positions: CaretPosition[], pos: CaretPosition): Option<CaretPosition> => Arr.head(pos.getClientRects()).bind((targetRect) => findClosestHorizontalPositionFromPoint(positions, targetRect.left));

const getPositionsUntilPreviousLine = Fun.curry(getPositionsUntil, CaretPosition.isAbove, -1) as LineInfoFinder;
const getPositionsUntilNextLine = Fun.curry(getPositionsUntil, CaretPosition.isBelow, 1) as LineInfoFinder;
const isAtFirstLine = (scope: HTMLElement, pos: CaretPosition) => getPositionsUntilPreviousLine(scope, pos).breakAt.isNone();
const isAtLastLine = (scope: HTMLElement, pos: CaretPosition) => getPositionsUntilNextLine(scope, pos).breakAt.isNone();
const getPositionsAbove = Fun.curry(getAdjacentLinePositions, -1, getPositionsUntilPreviousLine) as CaretPositionsFinder;
const getPositionsBelow = Fun.curry(getAdjacentLinePositions, 1, getPositionsUntilNextLine) as CaretPositionsFinder;

const getFirstLinePositions = (scope: HTMLElement) => CaretFinder.firstPositionIn(scope).map((pos) => [ pos ].concat(getPositionsUntilNextLine(scope, pos).positions)).getOr([]);

const getLastLinePositions = (scope: HTMLElement) => CaretFinder.lastPositionIn(scope).map((pos) => getPositionsUntilPreviousLine(scope, pos).positions.concat(pos)).getOr([]);

const getClosestPositionAbove = (scope: HTMLElement, pos: CaretPosition): Option<CaretPosition> => findClosestHorizontalPosition(getPositionsAbove(scope, pos), pos);

const getClosestPositionBelow = (scope: HTMLElement, pos: CaretPosition): Option<CaretPosition> => findClosestHorizontalPosition(getPositionsBelow(scope, pos), pos);

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
