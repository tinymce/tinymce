/**
 * InsertSpace.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.InsertSpace',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.keyboard.BoundaryLocation'
  ],
  function (Fun, CaretPosition, NodeType, BoundaryLocation) {
    var isValidInsertPoint = function (location, caretPosition) {
      return isAtStartOrEnd(location) && NodeType.isText(caretPosition.container());
    };

    var insertNbspAtPosition = function (editor, caretPosition) {
      var container = caretPosition.container();
      var offset = caretPosition.offset();

      container.insertData(offset, '\u00a0');
      editor.selection.setCursorLocation(container, offset + 1);
    };

    var insertAtLocation = function (editor, caretPosition, location) {
      if (isValidInsertPoint(location, caretPosition)) {
        insertNbspAtPosition(editor, caretPosition);
        return true;
      } else {
        return false;
      }
    };

    var insertAtCaret = function (editor) {
      var caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());
      var boundaryLocation = BoundaryLocation.readLocation(editor.getBody(), caretPosition);
      return boundaryLocation.map(Fun.curry(insertAtLocation, editor, caretPosition)).getOr(false);
    };

    var isAtStartOrEnd = function (location) {
      return location.fold(
        Fun.constant(false), // Before
        Fun.constant(true),  // Start
        Fun.constant(true),  // End
        Fun.constant(false)  // After
      );
    };

    var insertAtSelection = function (editor) {
      return editor.selection.isCollapsed() ? insertAtCaret(editor) : false;
    };

    return {
      insertAtSelection: insertAtSelection
    };
  }
);
