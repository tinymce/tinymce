import { Adt, Fun, Optional } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { DomStructure } from '@ephox/robin';
import { PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import { WindowBridge } from '../api/WindowBridge';
import { Situs } from '../selection/Situs';
import * as Carets from './Carets';
import * as Rectangles from './Rectangles';

type Carets = Carets.Carets;

type NoneHandler<T> = () => T;
type RetryHandler<T> = (caret: Carets) => T;

export interface Retries {
  fold: <T> (
    none: NoneHandler<T>,
    retry: RetryHandler<T>
  ) => T;
  match: <T>(branches: {
    none: NoneHandler<T>;
    retry: RetryHandler<T>;
  }) => T;
  log: (label: string) => void;
}

export interface CaretMovement {
  point: (caret: Carets) => number;
  adjuster: (bridge: WindowBridge, element: SugarElement<Node>, guessBox: Carets, original: Carets, caret: Carets) => Retries;
  move: (caret: Carets, amount: number) => Carets;
  gather: (element: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean) => Optional<SugarElement<Node>>;
}

const JUMP_SIZE = 5;
const NUM_RETRIES = 100;

const adt: {
  none: () => Retries;
  retry: (caret: Carets) => Retries;
} = Adt.generate([
  { none: [] },
  { retry: [ 'caret' ] }
]);

const isOutside = (caret: Carets, box: Carets): boolean => {
  return caret.left < box.left || Math.abs(box.right - caret.left) < 1 || caret.left > box.right;
};

// Find the block and determine whether or not that block is outside. If it is outside, move up/down and right.
const inOutsideBlock = (bridge: WindowBridge, element: SugarElement<Node>, caret: Carets) => {
  return PredicateFind.closest(element, DomStructure.isBlock).fold(Fun.never, (cell) => {
    return Rectangles.getEntireBox(bridge, cell).exists((box) => {
      return isOutside(caret, box);
    });
  });
};

/*
 * The approach is as follows.
 *
 * The browser APIs for caret ranges return elements that are the closest text elements to your (x, y) position, even if those
 * closest elements are miles away. This causes problems when you are trying to identify what is immediately above or below
 * a cell, because often the closest text is in a cell that is in a completely different column. Therefore, the approach needs
 * to keep moving down until the thing that we are hitting is likely to be a true positive.
 *
 * Steps:
 *
 * 1. If the y position of the next guess is not different from the original, keep going.
 * 2a. If the guess box doesn't actually include the position looked for, then the browser has returned a node that does not have
 *    a rectangle which truly intercepts the point. So, keep going. Note, we used to jump straight away here, but that means that
 *    we might skip over something that wasn't considered close enough but was a better guess than just making the y value skip.
 * 2b. If the guess box exactly aligns with the caret, then adjust by 1 and go again. This is to get a more accurate offset.
 * 3. if the guess box does include the caret, but the guess box's parent cell does not *really* contain the caret, try again shifting
 *    only the x value. If the guess box's parent cell does *really* contain the caret (i.e. it is horizontally-aligned), then stop
 *    because the guess is GOOD.
 */

const adjustDown = (bridge: WindowBridge, element: SugarElement<Node>, guessBox: Carets, original: Carets, caret: Carets): Retries => {
  const lowerCaret = Carets.moveDown(caret, JUMP_SIZE);
  if (Math.abs(guessBox.bottom - original.bottom) < 1) {
    return adt.retry(lowerCaret);
  } else if (guessBox.top > caret.bottom) {
    return adt.retry(lowerCaret);
  } else if (guessBox.top === caret.bottom) {
    return adt.retry(Carets.moveDown(caret, 1));
  } else {
    return inOutsideBlock(bridge, element, caret) ? adt.retry(Carets.translate(lowerCaret, JUMP_SIZE, 0)) : adt.none();
  }
};

const adjustUp = (bridge: WindowBridge, element: SugarElement<Node>, guessBox: Carets, original: Carets, caret: Carets): Retries => {
  const higherCaret = Carets.moveUp(caret, JUMP_SIZE);
  if (Math.abs(guessBox.top - original.top) < 1) {
    return adt.retry(higherCaret);
  } else if (guessBox.bottom < caret.top) {
    return adt.retry(higherCaret);
  } else if (guessBox.bottom === caret.top) {
    return adt.retry(Carets.moveUp(caret, 1));
  } else {
    return inOutsideBlock(bridge, element, caret) ? adt.retry(Carets.translate(higherCaret, JUMP_SIZE, 0)) : adt.none();
  }
};

const upMovement: CaretMovement = {
  point: Carets.getTop,
  adjuster: adjustUp,
  move: Carets.moveUp,
  gather: DomGather.before
};

const downMovement: CaretMovement = {
  point: Carets.getBottom,
  adjuster: adjustDown,
  move: Carets.moveDown,
  gather: DomGather.after
};

const isAtTable = (bridge: WindowBridge, x: number, y: number): boolean => {
  return bridge.elementFromPoint(x, y).filter((elm) => {
    return SugarNode.name(elm) === 'table';
  }).isSome();
};

const adjustForTable = (bridge: WindowBridge, movement: CaretMovement, original: Carets, caret: Carets, numRetries: number) => {
  return adjustTil(bridge, movement, original, movement.move(caret, JUMP_SIZE), numRetries);
};

const adjustTil = (bridge: WindowBridge, movement: CaretMovement, original: Carets, caret: Carets, numRetries: number): Optional<Carets> => {
  if (numRetries === 0) {
    return Optional.some(caret);
  }
  if (isAtTable(bridge, caret.left, movement.point(caret))) {
    return adjustForTable(bridge, movement, original, caret, numRetries - 1);
  }

  return bridge.situsFromPoint(caret.left, movement.point(caret)).bind((guess) => {
    return guess.start.fold<Optional<Carets>>(Optional.none, (element) => {
      return Rectangles.getEntireBox(bridge, element).bind((guessBox) => {
        return movement.adjuster(bridge, element, guessBox, original, caret).fold<Optional<Carets>>(
          Optional.none,
          (newCaret) => {
            return adjustTil(bridge, movement, original, newCaret, numRetries - 1);
          }
        );
      }).orThunk(() => {
        return Optional.some(caret);
      });
    }, Optional.none);
  });
};

const checkScroll = (movement: CaretMovement, adjusted: Carets, bridge: WindowBridge): Optional<number> => {
  // I'm not convinced that this is right. Let's re-examine it later.
  if (movement.point(adjusted) > bridge.getInnerHeight()) {
    return Optional.some(movement.point(adjusted) - bridge.getInnerHeight());
  } else if (movement.point(adjusted) < 0) {
    return Optional.some(-movement.point(adjusted));
  } else {
    return Optional.none<number>();
  }
};

const retry = (movement: CaretMovement, bridge: WindowBridge, caret: Carets): Optional<Situs> => {
  const moved = movement.move(caret, JUMP_SIZE);
  const adjusted = adjustTil(bridge, movement, caret, moved, NUM_RETRIES).getOr(moved);
  return checkScroll(movement, adjusted, bridge).fold(() => {
    return bridge.situsFromPoint(adjusted.left, movement.point(adjusted));
  }, (delta) => {
    bridge.scrollBy(0, delta);
    return bridge.situsFromPoint(adjusted.left, movement.point(adjusted) - delta);
  });
};

export const Retries = {
  tryUp: Fun.curry(retry, upMovement),
  tryDown: Fun.curry(retry, downMovement),
  getJumpSize: Fun.constant(JUMP_SIZE)
};
