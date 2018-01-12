/**
 * CefNavigation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from '../Env';
import CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import CaretUtils from '../caret/CaretUtils';
import CaretWalker from '../caret/CaretWalker';
import LineUtils from '../caret/LineUtils';
import LineWalker from '../caret/LineWalker';
import NodeType from '../dom/NodeType';
import CefUtils from './CefUtils';
import RangeNodes from '../selection/RangeNodes';
import Arr from '../util/Arr';
import Fun from '../util/Fun';

const isContentEditableFalse = NodeType.isContentEditableFalse;
const getSelectedNode = RangeNodes.getSelectedNode;
const isAfterContentEditableFalse = CaretUtils.isAfterContentEditableFalse;
const isBeforeContentEditableFalse = CaretUtils.isBeforeContentEditableFalse;

const getVisualCaretPosition = function (walkFn, caretPosition) {
  while ((caretPosition = walkFn(caretPosition))) {
    if (caretPosition.isVisible()) {
      return caretPosition;
    }
  }

  return caretPosition;
};

const isMoveInsideSameBlock = function (fromCaretPosition, toCaretPosition) {
  const inSameBlock = CaretUtils.isInSameBlock(fromCaretPosition, toCaretPosition);

  // Handle bogus BR <p>abc|<br></p>
  if (!inSameBlock && NodeType.isBr(fromCaretPosition.getNode())) {
    return true;
  }

  return inSameBlock;
};

const isRangeInCaretContainerBlock = function (range) {
  return CaretContainer.isCaretContainerBlock(range.startContainer);
};

const getNormalizedRangeEndPoint = function (direction, rootNode, range) {
  range = CaretUtils.normalizeRange(direction, rootNode, range);

  if (direction === -1) {
    return CaretPosition.fromRangeStart(range);
  }

  return CaretPosition.fromRangeEnd(range);
};

const moveToCeFalseHorizontally = function (direction, editor, getNextPosFn, isBeforeContentEditableFalseFn, range) {
  let node, caretPosition, peekCaretPosition, rangeIsInContainerBlock;

  if (!range.collapsed) {
    node = getSelectedNode(range);
    if (isContentEditableFalse(node)) {
      return CefUtils.showCaret(direction, editor, node, direction === -1);
    }
  }

  rangeIsInContainerBlock = isRangeInCaretContainerBlock(range);
  caretPosition = getNormalizedRangeEndPoint(direction, editor.getBody(), range);

  if (isBeforeContentEditableFalseFn(caretPosition)) {
    return CefUtils.selectNode(editor, caretPosition.getNode(direction === -1));
  }

  caretPosition = getNextPosFn(caretPosition);
  if (!caretPosition) {
    if (rangeIsInContainerBlock) {
      return range;
    }

    return null;
  }

  if (isBeforeContentEditableFalseFn(caretPosition)) {
    return CefUtils.showCaret(direction, editor, caretPosition.getNode(direction === -1), direction === 1);
  }

  // Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
  peekCaretPosition = getNextPosFn(caretPosition);
  if (isBeforeContentEditableFalseFn(peekCaretPosition)) {
    if (isMoveInsideSameBlock(caretPosition, peekCaretPosition)) {
      return CefUtils.showCaret(direction, editor, peekCaretPosition.getNode(direction === -1), direction === 1);
    }
  }

  if (rangeIsInContainerBlock) {
    return CefUtils.renderRangeCaret(editor, caretPosition.toRange());
  }

  return null;
};

const moveToCeFalseVertically = function (direction, editor, walkerFn, range) {
  let caretPosition, linePositions, nextLinePositions,
    closestNextLineRect, caretClientRect, clientX,
    dist1, dist2, contentEditableFalseNode;

  contentEditableFalseNode = getSelectedNode(range);
  caretPosition = getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  linePositions = walkerFn(editor.getBody(), LineWalker.isAboveLine(1), caretPosition);
  nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));
  caretClientRect = Arr.last(caretPosition.getClientRects());

  if (isBeforeContentEditableFalse(caretPosition)) {
    contentEditableFalseNode = caretPosition.getNode();
  }

  if (isAfterContentEditableFalse(caretPosition)) {
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

      return CefUtils.showCaret(direction, editor, closestNextLineRect.node, dist1 < dist2);
    }
  }

  if (contentEditableFalseNode) {
    const caretPositions = LineWalker.positionsUntil(direction, editor.getBody(), LineWalker.isAboveLine(1), contentEditableFalseNode);

    closestNextLineRect = LineUtils.findClosestClientRect(Arr.filter(caretPositions, LineWalker.isLine(1)), clientX);
    if (closestNextLineRect) {
      return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange());
    }

    closestNextLineRect = Arr.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
    if (closestNextLineRect) {
      return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange());
    }
  }
};

const createTextBlock = function (editor) {
  const textBlock = editor.dom.create(editor.settings.forced_root_block);

  if (!Env.ie || Env.ie >= 11) {
    textBlock.innerHTML = '<br data-mce-bogus="1">';
  }

  return textBlock;
};

const exitPreBlock = function (editor, direction, range) {
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

const getHorizontalRange = function (editor, forward) {
  const caretWalker = CaretWalker(editor.getBody());
  const getNextVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.next);
  const getPrevVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.prev);
  let newRange;
  const direction = forward ? 1 : -1;
  const getNextPosFn = forward ? getNextVisualCaretPosition : getPrevVisualCaretPosition;
  const isBeforeContentEditableFalseFn = forward ? isBeforeContentEditableFalse : isAfterContentEditableFalse;
  const range = editor.selection.getRng();

  newRange = moveToCeFalseHorizontally(direction, editor, getNextPosFn, isBeforeContentEditableFalseFn, range);
  if (newRange) {
    return newRange;
  }

  newRange = exitPreBlock(editor, direction, range);
  if (newRange) {
    return newRange;
  }

  return null;
};

const getVerticalRange = function (editor, down) {
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

const moveH = function (editor, forward) {
  return function () {
    const newRng = getHorizontalRange(editor, forward);

    if (newRng) {
      editor.selection.setRng(newRng);
      return true;
    } else {
      return false;
    }
  };
};

const moveV = function (editor, down) {
  return function () {
    const newRng = getVerticalRange(editor, down);

    if (newRng) {
      editor.selection.setRng(newRng);
      return true;
    } else {
      return false;
    }
  };
};

export default {
  moveH,
  moveV
};