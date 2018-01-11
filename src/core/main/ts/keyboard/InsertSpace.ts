/**
 * InsertSpace.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import CaretPosition from '../caret/CaretPosition';
import NodeType from '../dom/NodeType';
import BoundaryLocation from './BoundaryLocation';
import InlineUtils from './InlineUtils';

const isValidInsertPoint = function (location, caretPosition) {
  return isAtStartOrEnd(location) && NodeType.isText(caretPosition.container());
};

const insertNbspAtPosition = function (editor, caretPosition) {
  const container = caretPosition.container();
  const offset = caretPosition.offset();

  container.insertData(offset, '\u00a0');
  editor.selection.setCursorLocation(container, offset + 1);
};

const insertAtLocation = function (editor, caretPosition, location) {
  if (isValidInsertPoint(location, caretPosition)) {
    insertNbspAtPosition(editor, caretPosition);
    return true;
  } else {
    return false;
  }
};

const insertAtCaret = function (editor) {
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());
  const boundaryLocation = BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), caretPosition);
  return boundaryLocation.map(Fun.curry(insertAtLocation, editor, caretPosition)).getOr(false);
};

const isAtStartOrEnd = function (location) {
  return location.fold(
    Fun.constant(false), // Before
    Fun.constant(true),  // Start
    Fun.constant(true),  // End
    Fun.constant(false)  // After
  );
};

const insertAtSelection = function (editor) {
  return editor.selection.isCollapsed() ? insertAtCaret(editor) : false;
};

export default {
  insertAtSelection
};