import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as CefUtils from '../dom/CefUtils';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { isInlineFakeCaretTarget } from './FakeCaret';

const showCaret = (direction: number, editor: Editor, node: HTMLElement, before: boolean, scrollIntoView: boolean): Optional<Range> =>
  // TODO: Figure out a better way to handle this dependency
  Optional.from(editor._selectionOverrides.showCaret(direction, node, before, scrollIntoView));

const getNodeRange = (node: Element): Range => {
  const rng = node.ownerDocument.createRange();
  rng.selectNode(node);
  return rng;
};

const selectNode = (editor: Editor, node: Element): Optional<Range> => {
  const e = editor.dispatch('BeforeObjectSelected', { target: node });
  if (e.isDefaultPrevented()) {
    return Optional.none();
  }

  return Optional.some(getNodeRange(node));
};

const renderCaretAtRange = (editor: Editor, range: Range, scrollIntoView: boolean): Optional<Range> => {
  const normalizedRange = CaretUtils.normalizeRange(1, editor.getBody(), range);
  const caretPosition = CaretPosition.fromRangeStart(normalizedRange);

  const caretPositionNode = caretPosition.getNode();

  if (isInlineFakeCaretTarget(caretPositionNode)) {
    return showCaret(1, editor, caretPositionNode, !caretPosition.isAtEnd(), false);
  }

  const caretPositionBeforeNode = caretPosition.getNode(true);
  if (isInlineFakeCaretTarget(caretPositionBeforeNode)) {
    return showCaret(1, editor, caretPositionBeforeNode, false, false);
  }

  // TODO: Should render caret before/after depending on where you click on the page forces after now
  const ceRoot = CefUtils.getContentEditableRoot(editor.dom.getRoot(), caretPosition.getNode());
  if (isInlineFakeCaretTarget(ceRoot)) {
    return showCaret(1, editor, ceRoot, false, scrollIntoView);
  }

  return Optional.none();
};

const renderRangeCaret = (editor: Editor, range: Range, scrollIntoView: boolean): Range =>
  range.collapsed ? renderCaretAtRange(editor, range, scrollIntoView).getOr(range) : range;

export {
  showCaret,
  selectNode,
  renderCaretAtRange,
  renderRangeCaret
};
