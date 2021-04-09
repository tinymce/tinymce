/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import { CaretWalker, HDirection } from '../caret/CaretWalker';
import * as FakeCaretUtils from '../caret/FakeCaretUtils';
import { getPositionsUntilNextLine, getPositionsUntilPreviousLine } from '../caret/LineReader';
import * as LineUtils from '../caret/LineUtils';
import * as LineWalker from '../caret/LineWalker';
import * as ScrollIntoView from '../dom/ScrollIntoView';
import * as RangeNodes from '../selection/RangeNodes';
import * as ArrUtils from '../util/ArrUtils';
import * as InlineUtils from './InlineUtils';

const moveToRange = (editor: Editor, rng: Range) => {
  editor.selection.setRng(rng);
  // Don't reuse the original range as TinyMCE will adjust it
  ScrollIntoView.scrollRangeIntoView(editor, editor.selection.getRng());
};

const renderRangeCaretOpt = (editor: Editor, range: Range, scrollIntoView: boolean): Optional<Range> =>
  Optional.some(FakeCaretUtils.renderRangeCaret(editor, range, scrollIntoView));

const moveHorizontally = (editor: Editor, direction: HDirection, range: Range, isBefore: (caretPosition: CaretPosition) => boolean,
                          isAfter: (caretPosition: CaretPosition) => boolean, isElement: (node: Node) => node is Element): Optional<Range> => {
  const forwards = direction === HDirection.Forwards;
  const caretWalker = CaretWalker(editor.getBody());
  const getNextPosFn = Fun.curry(CaretUtils.getVisualCaretPosition, forwards ? caretWalker.next : caretWalker.prev);
  const isBeforeFn = forwards ? isBefore : isAfter;

  if (!range.collapsed) {
    const node = RangeNodes.getSelectedNode(range);
    if (isElement(node)) {
      return FakeCaretUtils.showCaret(direction, editor, node, direction === HDirection.Backwards, false);
    }
  }

  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  if (isBeforeFn(caretPosition)) {
    return FakeCaretUtils.selectNode(editor, caretPosition.getNode(!forwards) as Element);
  }

  const nextCaretPosition = InlineUtils.normalizePosition(forwards, getNextPosFn(caretPosition));
  const rangeIsInContainerBlock = CaretContainer.isRangeInCaretContainerBlock(range);
  if (!nextCaretPosition) {
    return rangeIsInContainerBlock ? Optional.some(range) : Optional.none();
  }

  if (isBeforeFn(nextCaretPosition)) {
    return FakeCaretUtils.showCaret(direction, editor, nextCaretPosition.getNode(!forwards) as Element, forwards, false);
  }

  // Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
  const peekCaretPosition = getNextPosFn(nextCaretPosition);
  if (peekCaretPosition && isBeforeFn(peekCaretPosition)) {
    if (CaretUtils.isMoveInsideSameBlock(nextCaretPosition, peekCaretPosition)) {
      return FakeCaretUtils.showCaret(direction, editor, peekCaretPosition.getNode(!forwards) as Element, forwards, false);
    }
  }

  if (rangeIsInContainerBlock) {
    return renderRangeCaretOpt(editor, nextCaretPosition.toRange(), false);
  }

  return Optional.none();
};

const moveVertically = (editor: Editor, direction: LineWalker.VDirection, range: Range, isBefore: (caretPosition: CaretPosition) => boolean,
                        isAfter: (caretPosition: CaretPosition) => boolean, isElement: (node: Node) => node is Element): Optional<Range> => {
  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  const caretClientRect = ArrUtils.last(caretPosition.getClientRects());
  const forwards = direction === LineWalker.VDirection.Down;

  if (!caretClientRect) {
    return Optional.none();
  }

  const walkerFn = forwards ? LineWalker.downUntil : LineWalker.upUntil;
  const linePositions = walkerFn(editor.getBody(), LineWalker.isAboveLine(1), caretPosition);
  const nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));

  const clientX = caretClientRect.left;
  const nextLineRect = LineUtils.findClosestClientRect(nextLinePositions, clientX);
  if (nextLineRect && isElement(nextLineRect.node)) {
    const dist1 = Math.abs(clientX - nextLineRect.left);
    const dist2 = Math.abs(clientX - nextLineRect.right);

    return FakeCaretUtils.showCaret(direction, editor, nextLineRect.node, dist1 < dist2, false);
  }

  let currentNode;
  if (isBefore(caretPosition)) {
    currentNode = caretPosition.getNode();
  } else if (isAfter(caretPosition)) {
    currentNode = caretPosition.getNode(true);
  } else {
    currentNode = RangeNodes.getSelectedNode(range);
  }

  if (currentNode) {
    const caretPositions = LineWalker.positionsUntil(direction, editor.getBody(), LineWalker.isAboveLine(1), currentNode);

    let closestNextLineRect = LineUtils.findClosestClientRect(Arr.filter(caretPositions, LineWalker.isLine(1)), clientX);
    if (closestNextLineRect) {
      return renderRangeCaretOpt(editor, closestNextLineRect.position.toRange(), false);
    }

    closestNextLineRect = ArrUtils.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
    if (closestNextLineRect) {
      return renderRangeCaretOpt(editor, closestNextLineRect.position.toRange(), false);
    }
  }

  if (nextLinePositions.length === 0) {
    return getLineEndPoint(editor, forwards).filter(forwards ? isAfter : isBefore)
      .map((pos) => FakeCaretUtils.renderRangeCaret(editor, pos.toRange(), false));
  }

  return Optional.none();
};

const getLineEndPoint = (editor: Editor, forward: boolean): Optional<CaretPosition> => {
  const rng = editor.selection.getRng();
  const body = editor.getBody();

  if (forward) {
    const from = CaretPosition.fromRangeEnd(rng);
    const result = getPositionsUntilNextLine(body, from);
    return Arr.last(result.positions);
  } else {
    const from = CaretPosition.fromRangeStart(rng);
    const result = getPositionsUntilPreviousLine(body, from);
    return Arr.head(result.positions);
  }
};

const moveToLineEndPoint = (editor: Editor, forward: boolean, isElementPosition: (pos: CaretPosition) => boolean) =>
  getLineEndPoint(editor, forward).filter(isElementPosition).exists((pos) => {
    editor.selection.setRng(pos.toRange());
    return true;
  });

export {
  getLineEndPoint,
  moveHorizontally,
  moveVertically,
  moveToLineEndPoint,
  moveToRange
};
