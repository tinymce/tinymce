/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Range } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Settings from '../api/Settings';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import { isAfterContentEditableFalse, isAfterTable, isBeforeContentEditableFalse, isBeforeTable } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { CaretWalker, HDirection } from '../caret/CaretWalker';
import { getPositionsUntilNextLine, getPositionsUntilPreviousLine } from '../caret/LineReader';
import * as LineUtils from '../caret/LineUtils';
import * as LineWalker from '../caret/LineWalker';
import * as NodeType from '../dom/NodeType';
import * as InlineUtils from '../keyboard/InlineUtils';
import * as RangeNodes from '../selection/RangeNodes';
import * as ArrUtils from '../util/ArrUtils';
import * as CefUtils from './CefUtils';

const isContentEditableFalse = NodeType.isContentEditableFalse;
const getSelectedNode = RangeNodes.getSelectedNode;

const moveToCeFalseHorizontally = (direction: HDirection, editor: Editor, getNextPosFn: (pos: CaretPosition) => CaretPosition, range: Range): Range => {
  const forwards = direction === HDirection.Forwards;
  const isBeforeContentEditableFalseFn = forwards ? isBeforeContentEditableFalse : isAfterContentEditableFalse;

  if (!range.collapsed) {
    const node = getSelectedNode(range);
    if (isContentEditableFalse(node)) {
      return CefUtils.showCaret(direction, editor, node, direction === HDirection.Backwards, true);
    }
  }

  const rangeIsInContainerBlock = CaretContainer.isRangeInCaretContainerBlock(range);
  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);

  if (isBeforeContentEditableFalseFn(caretPosition)) {
    return CefUtils.selectNode(editor, caretPosition.getNode(!forwards) as Element);
  }

  const nextCaretPosition = InlineUtils.normalizePosition(forwards, getNextPosFn(caretPosition));
  if (!nextCaretPosition) {
    if (rangeIsInContainerBlock) {
      return range;
    }

    return null;
  }

  if (isBeforeContentEditableFalseFn(nextCaretPosition)) {
    return CefUtils.showCaret(direction, editor, nextCaretPosition.getNode(!forwards) as Element, forwards, true);
  }

  // Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
  const peekCaretPosition = getNextPosFn(nextCaretPosition);
  if (peekCaretPosition && isBeforeContentEditableFalseFn(peekCaretPosition)) {
    if (CaretUtils.isMoveInsideSameBlock(nextCaretPosition, peekCaretPosition)) {
      return CefUtils.showCaret(direction, editor, peekCaretPosition.getNode(!forwards) as Element, forwards, true);
    }
  }

  if (rangeIsInContainerBlock) {
    return CefUtils.renderRangeCaret(editor, nextCaretPosition.toRange(), true);
  }

  return null;
};

type WalkerFunction = (root: Element, pred: (clientRect: LineWalker.ClientRectLine) => boolean, pos: CaretPosition) => LineWalker.ClientRectLine[];

const moveToCeFalseVertically = (direction: LineWalker.VDirection, editor: Editor, walkerFn: WalkerFunction, range: Range) => {
  let closestNextLineRect, dist1, dist2, contentEditableFalseNode;

  contentEditableFalseNode = getSelectedNode(range);
  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  const linePositions = walkerFn(editor.getBody(), LineWalker.isAboveLine(1), caretPosition);
  const nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));
  const caretClientRect = ArrUtils.last(caretPosition.getClientRects());

  if (isBeforeContentEditableFalse(caretPosition) || isBeforeTable(caretPosition)) {
    contentEditableFalseNode = caretPosition.getNode();
  }

  if (isAfterContentEditableFalse(caretPosition) || isAfterTable(caretPosition)) {
    contentEditableFalseNode = caretPosition.getNode(true);
  }

  if (!caretClientRect) {
    return null;
  }

  const clientX = caretClientRect.left;

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

    closestNextLineRect = ArrUtils.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
    if (closestNextLineRect) {
      return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange(), true);
    }
  }
};

const createTextBlock = (editor: Editor): Element => {
  const textBlock = editor.dom.create(Settings.getForcedRootBlock(editor));

  if (!Env.ie || Env.ie >= 11) {
    textBlock.innerHTML = '<br data-mce-bogus="1">';
  }

  return textBlock;
};

const exitPreBlock = (editor: Editor, direction: HDirection, range: Range): void => {
  let pre, caretPos, newBlock;
  const caretWalker = CaretWalker(editor.getBody());
  const getNextVisualCaretPosition = Fun.curry(CaretUtils.getVisualCaretPosition, caretWalker.next);
  const getPrevVisualCaretPosition = Fun.curry(CaretUtils.getVisualCaretPosition, caretWalker.prev);

  if (range.collapsed && Settings.hasForcedRootBlock(editor)) {
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

const getHorizontalRange = (editor: Editor, forward: boolean): Range => {
  const caretWalker = CaretWalker(editor.getBody());
  const getNextVisualCaretPosition = Fun.curry(CaretUtils.getVisualCaretPosition, caretWalker.next);
  const getPrevVisualCaretPosition = Fun.curry(CaretUtils.getVisualCaretPosition, caretWalker.prev);
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

const getVerticalRange = (editor: Editor, down: boolean): Range => {
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

const moveH = (editor: Editor, forward: boolean) => () => {
  const newRng = getHorizontalRange(editor, forward);

  if (newRng) {
    editor.selection.setRng(newRng);
    return true;
  } else {
    return false;
  }
};

const moveV = (editor: Editor, down: boolean) => () => {
  const newRng = getVerticalRange(editor, down);

  if (newRng) {
    editor.selection.setRng(newRng);
    return true;
  } else {
    return false;
  }
};

const isCefPosition = (forward: boolean) => (pos: CaretPosition) => forward ? isAfterContentEditableFalse(pos) : isBeforeContentEditableFalse(pos);

const moveToLineEndPoint = (editor: Editor, forward: boolean) => () => {
  const from = forward ? CaretPosition.fromRangeEnd(editor.selection.getRng()) : CaretPosition.fromRangeStart(editor.selection.getRng());
  const result = forward ? getPositionsUntilNextLine(editor.getBody(), from) : getPositionsUntilPreviousLine(editor.getBody(), from);
  const to = forward ? Arr.last(result.positions) : Arr.head(result.positions);
  return to.filter(isCefPosition(forward)).fold(
    Fun.constant(false),
    (pos) => {
      editor.selection.setRng(pos.toRange());
      return true;
    }
  );
};

export {
  moveH,
  moveV,
  moveToLineEndPoint
};
