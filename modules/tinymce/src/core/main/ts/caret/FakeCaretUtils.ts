/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { isInlineFakeCaretTarget } from './FakeCaret';

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;

const showCaret = (direction: number, editor: Editor, node: Element, before: boolean, scrollIntoView: boolean): Optional<Range> =>
  // TODO: Figure out a better way to handle this dependency
  Optional.from(editor._selectionOverrides.showCaret(direction, node, before, scrollIntoView));

const getNodeRange = (node: Element): Range => {
  const rng = node.ownerDocument.createRange();
  rng.selectNode(node);
  return rng;
};

const selectNode = (editor: Editor, node: Element): Optional<Range> => {
  const e = editor.fire('BeforeObjectSelected', { target: node });
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
  const ceRoot = editor.dom.getParent(caretPosition.getNode(), (node) => isContentEditableFalse(node) || isContentEditableTrue(node));
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
