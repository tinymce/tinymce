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
import { Text } from '@ephox/dom-globals';
import { Editor } from '../api/Editor';

const isValidInsertPoint = (location, pos: CaretPosition) => {
  return isAtStartOrEnd(location) && NodeType.isText(pos.container());
};

const insertNbspAtPosition = (editor: Editor, pos: CaretPosition) => {
  const container = pos.container() as Text;
  const offset = pos.offset();

  container.insertData(offset, '\u00a0');
  editor.selection.setCursorLocation(container, offset + 1);
};

const insertAtLocation = (editor: Editor, pos: CaretPosition, location) => {
  if (isValidInsertPoint(location, pos)) {
    insertNbspAtPosition(editor, pos);
    return true;
  } else {
    return false;
  }
};

const insertAtCaret = (editor: Editor): boolean => {
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());
  const boundaryLocation = BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), caretPosition);
  return boundaryLocation.map(Fun.curry(insertAtLocation, editor, caretPosition)).getOr(false);
};

const isAtStartOrEnd = (location) => {
  return location.fold(
    Fun.constant(false), // Before
    Fun.constant(true),  // Start
    Fun.constant(true),  // End
    Fun.constant(false)  // After
  );
};

const insertAtSelection = (editor: Editor): boolean => {
  return editor.selection.isCollapsed() ? insertAtCaret(editor) : false;
};

export {
  insertAtSelection
};