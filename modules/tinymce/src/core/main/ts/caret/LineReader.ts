import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';

import * as NodeType from '../dom/NodeType';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { isInSameBlock } from './CaretUtils';
import { CaretWalker, HDirection } from './CaretWalker';

export enum BreakType {
  Br,
  Block,
  Wrap,
  Eol
}

export interface LineInfo {
  positions: CaretPosition[];
  breakType: BreakType;
  breakAt: Optional<CaretPosition>;
}

type CheckerPredicate = typeof CaretPosition.isAbove | typeof CaretPosition.isBelow;
type LineInfoFinder = (scope: HTMLElement, start: CaretPosition) => LineInfo;

const flip = (direction: HDirection, positions: CaretPosition[]): CaretPosition[] =>
  direction === HDirection.Backwards ? Arr.reverse(positions) : positions;

const walk = (direction: HDirection, caretWalker: CaretWalker, pos: CaretPosition): CaretPosition | null =>
  direction === HDirection.Forwards ? caretWalker.next(pos) : caretWalker.prev(pos);

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
  let currentPos = start;
  const positions: CaretPosition[] = [];

  while (currentPos) {
    const nextPos = walk(direction, caretWalker, currentPos);

    if (!nextPos) {
      break;
    }

    if (NodeType.isBr(nextPos.getNode(false))) {
      if (direction === HDirection.Forwards) {
        return { positions: flip(direction, positions).concat([ nextPos ]), breakType: BreakType.Br, breakAt: Optional.some(nextPos) };
      } else {
        return { positions: flip(direction, positions), breakType: BreakType.Br, breakAt: Optional.some(nextPos) };
      }
    }

    if (!nextPos.isVisible()) {
      currentPos = nextPos;
      continue;
    }

    if (predicate(currentPos, nextPos)) {
      const breakType = getBreakType(scope, direction, currentPos, nextPos);
      return { positions: flip(direction, positions), breakType, breakAt: Optional.some(nextPos) };
    }

    positions.push(nextPos);
    currentPos = nextPos;
  }

  return { positions: flip(direction, positions), breakType: BreakType.Eol, breakAt: Optional.none() };
};

const getAdjacentLinePositions = (direction: HDirection, getPositionsUntilBreak: LineInfoFinder, scope: HTMLElement, start: CaretPosition): CaretPosition[] =>
  getPositionsUntilBreak(scope, start).breakAt.map((pos) => {
    const positions = getPositionsUntilBreak(scope, pos).positions;
    return direction === HDirection.Backwards ? positions.concat(pos) : [ pos ].concat(positions);
  }).getOr([]);

const findClosestHorizontalPositionFromPoint = (positions: CaretPosition[], x: number): Optional<CaretPosition> =>
  Arr.foldl(positions, (acc, newPos) => acc.fold(
    () => Optional.some(newPos),
    (lastPos) => Optionals.lift2(Arr.head(lastPos.getClientRects()), Arr.head(newPos.getClientRects()), (lastRect, newRect) => {
      const lastDist = Math.abs(x - lastRect.left);
      const newDist = Math.abs(x - newRect.left);
      return newDist <= lastDist ? newPos : lastPos;
    }).or(acc)
  ), Optional.none());

const findClosestHorizontalPosition = (positions: CaretPosition[], pos: CaretPosition): Optional<CaretPosition> =>
  Arr.head(pos.getClientRects()).bind((targetRect) => findClosestHorizontalPositionFromPoint(positions, targetRect.left));

const getPositionsUntilPreviousLine = Fun.curry(getPositionsUntil, CaretPosition.isAbove, -1);
const getPositionsUntilNextLine = Fun.curry(getPositionsUntil, CaretPosition.isBelow, 1);
const getPositionsAbove = Fun.curry(getAdjacentLinePositions, -1, getPositionsUntilPreviousLine);
const getPositionsBelow = Fun.curry(getAdjacentLinePositions, 1, getPositionsUntilNextLine);

const isAtFirstLine = (scope: HTMLElement, pos: CaretPosition): boolean =>
  getPositionsUntilPreviousLine(scope, pos).breakAt.isNone();

const isAtLastLine = (scope: HTMLElement, pos: CaretPosition): boolean =>
  getPositionsUntilNextLine(scope, pos).breakAt.isNone();

const getFirstLinePositions = (scope: HTMLElement): CaretPosition[] =>
  CaretFinder.firstPositionIn(scope).map((pos) => [ pos ].concat(getPositionsUntilNextLine(scope, pos).positions)).getOr([]);

const getLastLinePositions = (scope: HTMLElement): CaretPosition[] =>
  CaretFinder.lastPositionIn(scope).map((pos) => getPositionsUntilPreviousLine(scope, pos).positions.concat(pos)).getOr([]);

const getClosestPositionAbove = (scope: HTMLElement, pos: CaretPosition): Optional<CaretPosition> =>
  findClosestHorizontalPosition(getPositionsAbove(scope, pos), pos);

const getClosestPositionBelow = (scope: HTMLElement, pos: CaretPosition): Optional<CaretPosition> =>
  findClosestHorizontalPosition(getPositionsBelow(scope, pos), pos);

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
