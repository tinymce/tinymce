import Carets from './Carets';
import Rectangles from './Rectangles';
import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { DomStructure } from '@ephox/robin';
import { Node } from '@ephox/sugar';
import { PredicateFind } from '@ephox/sugar';

var JUMP_SIZE = 5;
var NUM_RETRIES = 100;

var adt = Adt.generate([
  { 'none' : [] },
  { 'retry': [ 'caret' ] }
]);

var isOutside = function (caret, box) {
  return caret.left() < box.left() || Math.abs(box.right() - caret.left()) < 1 || caret.left() > box.right();
};

// Find the block and determine whether or not that block is outside. If it is outside, move up/down and right.
var inOutsideBlock = function (bridge, element, caret) {
  return PredicateFind.closest(element, DomStructure.isBlock).fold(Fun.constant(false), function (cell) {
    return Rectangles.getEntireBox(bridge, cell).exists(function (box) {
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

var adjustDown = function (bridge, element, guessBox, original, caret) {
  var lowerCaret = Carets.moveDown(caret, JUMP_SIZE);
  if (Math.abs(guessBox.bottom() - original.bottom()) < 1) return adt.retry(lowerCaret);
  else if (guessBox.top() > caret.bottom()) return adt.retry(lowerCaret);
  else if (guessBox.top() === caret.bottom()) return adt.retry(Carets.moveDown(caret, 1));
  else return inOutsideBlock(bridge, element, caret) ? adt.retry(Carets.translate(lowerCaret, JUMP_SIZE, 0)) : adt.none();
};

var adjustUp = function (bridge, element, guessBox, original, caret) {
  var higherCaret = Carets.moveUp(caret, JUMP_SIZE);
  if (Math.abs(guessBox.top() - original.top()) < 1) return adt.retry(higherCaret);
  else if (guessBox.bottom() < caret.top()) return adt.retry(higherCaret);
  else if (guessBox.bottom() === caret.top()) return adt.retry(Carets.moveUp(caret, 1));
  else return inOutsideBlock(bridge, element, caret) ? adt.retry(Carets.translate(higherCaret, JUMP_SIZE, 0)) : adt.none();
};

var upMovement = {
  point: Carets.getTop,
  adjuster: adjustUp,
  move: Carets.moveUp,
  gather: DomGather.before
};

var downMovement = {
  point: Carets.getBottom,
  adjuster: adjustDown,
  move: Carets.moveDown,
  gather: DomGather.after
};

var isAtTable = function (bridge, x, y) {
  return bridge.elementFromPoint(x, y).filter(function (elm) {
    return Node.name(elm) === 'table';
  }).isSome();
};

var adjustForTable = function (bridge, movement, original, caret, numRetries) {
  return adjustTil(bridge, movement, original, movement.move(caret, JUMP_SIZE), numRetries);
};

var adjustTil = function (bridge, movement, original, caret, numRetries) {
  if (numRetries === 0) return Option.some(caret);
  if (isAtTable(bridge, caret.left(), movement.point(caret))) return adjustForTable(bridge, movement, original, caret, numRetries-1);

  return bridge.situsFromPoint(caret.left(), movement.point(caret)).bind(function (guess) {
    return guess.start().fold(Option.none, function (element, offset) {
      return Rectangles.getEntireBox(bridge, element, offset).bind(function (guessBox) {
        return movement.adjuster(bridge, element, guessBox, original, caret).fold(
          Option.none,
          function (newCaret) {
            return adjustTil(bridge, movement, original, newCaret, numRetries-1);
          }
        );
      }).orThunk(function () {
        return Option.some(caret);
      });
    }, Option.none);
  });
};

var ieTryDown = function (bridge, caret) {
  return bridge.situsFromPoint(caret.left(), caret.bottom() + JUMP_SIZE);
};

var ieTryUp = function (bridge, caret) {
  return bridge.situsFromPoint(caret.left(), caret.top() - JUMP_SIZE);
};

var checkScroll = function (movement, adjusted, bridge) {
  // I'm not convinced that this is right. Let's re-examine it later.
  if (movement.point(adjusted) > bridge.getInnerHeight()) return Option.some(movement.point(adjusted) - bridge.getInnerHeight());
  else if (movement.point(adjusted) < 0) return Option.some(-movement.point(adjusted));
  else return Option.none();
};

var retry = function (movement, bridge, caret) {
  var moved = movement.move(caret, JUMP_SIZE);
  var adjusted = adjustTil(bridge, movement, caret, moved, NUM_RETRIES).getOr(moved);
  return checkScroll(movement, adjusted, bridge).fold(function () {
    return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted));
  }, function (delta) {
    bridge.scrollBy(0, delta);
    return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted) - delta);
  });
};

export default <any> {
  tryUp: Fun.curry(retry, upMovement),
  tryDown: Fun.curry(retry, downMovement),
  ieTryUp: ieTryUp,
  ieTryDown: ieTryDown,
  getJumpSize: Fun.constant(JUMP_SIZE)
};