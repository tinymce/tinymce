/**
 * CefNavigation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from '../api/Env';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import { HDirection, CaretWalker } from '../caret/CaretWalker';
import * as LineUtils from '../caret/LineUtils';
import * as LineWalker from '../caret/LineWalker';
import NodeType from '../dom/NodeType';
import * as CefUtils from './CefUtils';
import * as RangeNodes from '../selection/RangeNodes';
import Arr from '../util/Arr';
import Fun from '../util/Fun';
import { Range, Element } from '@ephox/dom-globals';

const isContentEditableFalse = NodeType.isContentEditableFalse;
const getSelectedNode = RangeNodes.getSelectedNode;
const isAfterContentEditableFalse = CaretUtils.isAfterContentEditableFalse;
const isBeforeContentEditableFalse = CaretUtils.isBeforeContentEditableFalse;

const getVisualCaretPosition = (walkFn, caretPosition: CaretPosition): CaretPosition => {
  while ((caretPosition = walkFn(caretPosition))) {
    if (caretPosition.isVisible()) {
      return caretPosition;
    }
  }

  return caretPosition;
};

const isMoveInsideSameBlock = (from: CaretPosition, to: CaretPosition): boolean => {
  const inSameBlock = CaretUtils.isInSameBlock(from, to);

  // Handle bogus BR <p>abc|<br></p>
  if (!inSameBlock && NodeType.isBr(from.getNode())) {
    return true;
  }

  return inSameBlock;
};

const moveToCeFalseHorizontally = (direction: HDirection, editor, getNextPosFn, range): Range => {
  let node, caretPosition, peekCaretPosition, rangeIsInContainerBlock;
  const forwards = direction === HDirection.Forwards;
  const isBeforeContentEditableFalseFn = forwards ? isBeforeContentEditableFalse : isAfterContentEditableFalse;

  if (!range.collapsed) {
    node = getSelectedNode(range);
    if (isContentEditableFalse(node)) {
      return CefUtils.showCaret(direction, editor, node, direction === HDirection.Backwards, true);
    }
  }

  rangeIsInContainerBlock = CaretContainer.isRangeInCaretContainerBlock(range);
  caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);

  if (isBeforeContentEditableFalseFn(caretPosition)) {
    return CefUtils.selectNode(editor, caretPosition.getNode(!forwards));
  }

  caretPosition = getNextPosFn(caretPosition);
  if (!caretPosition) {
    if (rangeIsInContainerBlock) {
      return range;
    }

    return null;
  }

  if (isBeforeContentEditableFalseFn(caretPosition)) {
    return CefUtils.showCaret(direction, editor, caretPosition.getNode(!forwards), forwards, true);
  }

  // Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
  peekCaretPosition = getNextPosFn(caretPosition);
  if (isBeforeContentEditableFalseFn(peekCaretPosition)) {
    if (isMoveInsideSameBlock(caretPosition, peekCaretPosition)) {
      return CefUtils.showCaret(direction, editor, peekCaretPosition.getNode(!forwards), forwards, true);
    }
  }

  if (rangeIsInContainerBlock) {
    return CefUtils.renderRangeCaret(editor, caretPosition.toRange(), true);
  }

  return null;
};

const moveToCeFalseVertically = function (direction: LineWalker.VDirection, editor, walkerFn, range: Range) {
  let caretPosition, linePositions, nextLinePositions;
  let closestNextLineRect, caretClientRect, clientX;
  let dist1, dist2, contentEditableFalseNode;

  contentEditableFalseNode = getSelectedNode(range);
  caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  linePositions = walkerFn(editor.getBody(), LineWalker.isAboveLine(1), caretPosition);
  nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));
  caretClientRect = Arr.last(caretPosition.getClientRects());

  if (isBeforeContentEditableFalse(caretPosition) || CaretUtils.isBeforeTable(caretPosition)) {
    contentEditableFalseNode = caretPosition.getNode();
  }

  if (isAfterContentEditableFalse(caretPosition) || CaretUtils.isAfterTable(caretPosition)) {
    contentEditableFalseNode = caretPosition.getNode(true);
  }

  if (!caretClientRect) {
    return null;
  }

  clientX = caretClientRect.left;

  closestNextLineRect = LineUtils.findClosestClientRect(nextLinePositions, clientX);
  if (closestNextLineRect) {
    if (isContentEditableFalse(closestNextLineRect.node)) {
      dist1 = Math.abs(clientX - closestNextLineRect.left);
      dist2 = Math.abs(clientX - closestNextLineRect.right);

      return CefUtils.showCaret(direction, editor, closestNextLineRect.node, dist1 < dist2, true);
    }
  }

  if (contentEditableFalseNode) {
    const caretPositions = LineWalker.positionsUntil(direction, editor.getBody(), LineWalker.isAboveLine(1), contentEditableFalseNode);

    closestNextLineRect = LineUtils.findClosestClientRect(Arr.filter(caretPositions, LineWalker.isLine(1)), clientX);
    if (closestNextLineRect) {
      return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange(), true);
    }

    closestNextLineRect = Arr.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
    if (closestNextLineRect) {
      return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange(), true);
    }
  }
};

const createTextBlock = (editor): Element => {
  const textBlock = editor.dom.create(editor.settings.forced_root_block);

  if (!Env.ie || Env.ie >= 11) {
    textBlock.innerHTML = '<br data-mce-bogus="1">';
  }

  return textBlock;
};

const exitPreBlock = (editor, direction: HDirection, range: Range): void => {
  let pre, caretPos, newBlock;
  const caretWalker = CaretWalker(editor.getBody());
  const getNextVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.next);
  const getPrevVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.prev);

  if (range.collapsed && editor.settings.forced_root_block) {
    pre = editor.dom.getParent(range.startContainer, 'PRE');
    if (!pre) {
      return;
    }

    if (direction === 1) {
      caretPos = getNextVisualCaretPosition(CaretPosition.fromRangeStart(range));
    } else {
      caretPos = getPrevVisualCaretPosition(CaretPosition.fromRangeStart(range));
    }

    if (!caretPos) {
      newBlock = createTextBlock(editor);

      if (direction === 1) {
        editor.$(pre).after(newBlock);
      } else {
        editor.$(pre).before(newBlock);
      }

      editor.selection.select(newBlock, true);
      editor.selection.collapse();
    }
  }
};

const getHorizontalRange = (editor, forward: boolean): Range => {
  const caretWalker = CaretWalker(editor.getBody());
  const getNextVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.next);
  const getPrevVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.prev);
  let newRange;
  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const getNextPosFn = forward ? getNextVisualCaretPosition : getPrevVisualCaretPosition;
  const range = editor.selection.getRng();

  newRange = moveToCeFalseHorizontally(direction, editor, getNextPosFn, range);
  if (newRange) {
    return newRange;
  }

  newRange = exitPreBlock(editor, direction, range);
  if (newRange) {
    return newRange;
  }

  return null;
};

const getVerticalRange = (editor, down: boolean): Range => {
  let newRange;
  const direction = down ? 1 : -1;
  const walkerFn = down ? LineWalker.downUntil : LineWalker.upUntil;
  const range = editor.selection.getRng();

  newRange = moveToCeFalseVertically(direction, editor, walkerFn, range);
  if (newRange) {
    return newRange;
  }

  newRange = exitPreBlock(editor, direction, range);
  if (newRange) {
    return newRange;
  }

  return null;
};

const moveH = (editor, forward: boolean) => {
  return () => {
    const newRng = getHorizontalRange(editor, forward);

    if (newRng) {
      editor.selection.setRng(newRng);
      return true;
    } else {
      return false;
    }
  };
};

const moveV = (editor, down: boolean) => {
  return () => {
    const newRng = getVerticalRange(editor, down);

    if (newRng) {
      editor.selection.setRng(newRng);
      return true;
    } else {
      return false;
    }
  };
};

export {
  moveH,
  moveV
};