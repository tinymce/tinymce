import { Fun, Optional } from '@ephox/katamari';

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

const trimEmptyTextNode = (dom: DOMUtils, node: Node | undefined): void => {
  if (NodeType.isText(node) && node.data.length === 0) {
    dom.remove(node);
  }
};

const deleteContentAndShowCaret = (editor: Editor, range: Range, node: Node | undefined, direction: HDirection, forward: boolean, peekCaretPosition: CaretPosition): void => {
  FakeCaretUtils.showCaret(direction, editor, peekCaretPosition.getNode(!forward) as HTMLElement, forward, true).each((caretRange) => {
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
};

// If the caret position is next to a fake caret target element (eg cef/media) after a delete operation, then ensure a caret is added
// eg. <span cE=false>a|b -> <span cE=false>|bc
// Note: We also need to handle the actual deletion, as some browsers (eg IE) move the selection to the opposite side of the cef element
const deleteBoundaryText = (editor: Editor, forward: boolean): Optional<() => void> => {
  const range = editor.selection.getRng();
  if (!NodeType.isText(range.commonAncestorContainer)) {
    return Optional.none();
  }

  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const caretWalker = CaretWalker(editor.getBody());
  const getNextPosFn = Fun.curry(CaretUtils.getVisualCaretPosition, forward ? caretWalker.next : caretWalker.prev);
  const isBeforeFn = forward ? isBeforeBoundary : isAfterBoundary;

  // Get the next caret position. ie where it'll be after the delete
  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  const nextCaretPosition = getNextPosFn(caretPosition);
  const normalizedNextCaretPosition = nextCaretPosition ? InlineUtils.normalizePosition(forward, nextCaretPosition) : nextCaretPosition;
  if (!normalizedNextCaretPosition || !CaretUtils.isMoveInsideSameBlock(caretPosition, normalizedNextCaretPosition)) {
    return Optional.none();
  } else if (isBeforeFn(normalizedNextCaretPosition)) {
    return Optional.some(() => deleteContentAndShowCaret(editor, range, caretPosition.getNode(), direction, forward, normalizedNextCaretPosition));
  }

  // Peek ahead and see if the next element is a cef/media element
  const peekCaretPosition = getNextPosFn(normalizedNextCaretPosition);
  if (peekCaretPosition && isBeforeFn(peekCaretPosition)) {
    if (CaretUtils.isMoveInsideSameBlock(normalizedNextCaretPosition, peekCaretPosition)) {
      return Optional.some(() => deleteContentAndShowCaret(editor, range, caretPosition.getNode(), direction, forward, peekCaretPosition));
    }
  }

  return Optional.none();
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  deleteBoundaryText(editor, forward);

export {
  backspaceDelete
};
