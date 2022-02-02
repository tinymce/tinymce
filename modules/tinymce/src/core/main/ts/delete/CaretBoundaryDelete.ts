/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import { isAfterContentEditableFalse, isAfterMedia, isBeforeContentEditableFalse, isBeforeMedia } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { CaretWalker, HDirection } from '../caret/CaretWalker';
import * as FakeCaretUtils from '../caret/FakeCaretUtils';
import * as NodeType from '../dom/NodeType';
import * as InlineUtils from '../keyboard/InlineUtils';

const isBeforeBoundary = (pos: CaretPosition) => isBeforeContentEditableFalse(pos) || isBeforeMedia(pos);
const isAfterBoundary = (pos: CaretPosition) => isAfterContentEditableFalse(pos) || isAfterMedia(pos);

const trimEmptyTextNode = (dom: DOMUtils, node: Node): void => {
  if (NodeType.isText(node) && node.data.length === 0) {
    dom.remove(node);
  }
};

const deleteContentAndShowCaret = (editor: Editor, range: Range, node: Node, direction: HDirection, forward: boolean, peekCaretPosition: CaretPosition): boolean => {
  FakeCaretUtils.showCaret(direction, editor, peekCaretPosition.getNode(!forward) as Element, forward, true).each((caretRange) => {
    // Delete the selected content
    if (range.collapsed) {
      const deleteRange = range.cloneRange();
      if (forward) {
        deleteRange.setEnd(caretRange.startContainer, caretRange.startOffset);
      } else {
        deleteRange.setStart(caretRange.endContainer, caretRange.endOffset);
      }
      deleteRange.deleteContents();
    } else {
      range.deleteContents();
    }
    editor.selection.setRng(caretRange);
  });
  trimEmptyTextNode(editor.dom, node);
  return true;
};

// If the caret position is next to a fake caret target element (eg cef/media) after a delete operation, then ensure a caret is added
// eg. <span cE=false>a|b -> <span cE=false>|bc
// Note: We also need to handle the actual deletion, as some browsers (eg IE) move the selection to the opposite side of the cef element
const deleteBoundaryText = (editor: Editor, forward: boolean): boolean => {
  const range = editor.selection.getRng();
  if (!NodeType.isText(range.commonAncestorContainer)) {
    return false;
  }

  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const caretWalker = CaretWalker(editor.getBody());
  const getNextPosFn = Fun.curry(CaretUtils.getVisualCaretPosition, forward ? caretWalker.next : caretWalker.prev);
  const isBeforeFn = forward ? isBeforeBoundary : isAfterBoundary;

  // Get the next caret position. ie where it'll be after the delete
  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  const nextCaretPosition = InlineUtils.normalizePosition(forward, getNextPosFn(caretPosition));
  if (!nextCaretPosition || !CaretUtils.isMoveInsideSameBlock(caretPosition, nextCaretPosition)) {
    return false;
  } else if (isBeforeFn(nextCaretPosition)) {
    return deleteContentAndShowCaret(editor, range, caretPosition.getNode(), direction, forward, nextCaretPosition);
  }

  // Peek ahead and see if the next element is a cef/media element
  const peekCaretPosition = getNextPosFn(nextCaretPosition);
  if (peekCaretPosition && isBeforeFn(peekCaretPosition)) {
    if (CaretUtils.isMoveInsideSameBlock(nextCaretPosition, peekCaretPosition)) {
      return deleteContentAndShowCaret(editor, range, caretPosition.getNode(), direction, forward, peekCaretPosition);
    }
  }

  return false;
};

const backspaceDelete = (editor: Editor, forward: boolean): boolean =>
  deleteBoundaryText(editor, forward);

export {
  backspaceDelete
};
