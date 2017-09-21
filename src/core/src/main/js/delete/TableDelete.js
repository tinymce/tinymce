/**
 * TableDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.TableDelete',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.DeleteElement',
    'tinymce.core.delete.TableDeleteAction',
    'tinymce.core.dom.PaddingBr',
    'tinymce.core.selection.TableCellSelection'
  ],
  function (Arr, Fun, Element, DeleteElement, TableDeleteAction, PaddingBr, TableCellSelection) {
    var emptyCells = function (editor, cells) {
      Arr.each(cells, PaddingBr.fillWithPaddingBr);
      editor.selection.setCursorLocation(cells[0].dom(), 0);

      return true;
    };

    var deleteTableElement = function (editor, table) {
      DeleteElement.deleteElement(editor, false, table);

      return true;
    };

    var handleCellRange = function (editor, rootNode, rng) {
      return TableDeleteAction.getActionFromRange(rootNode, rng)
        .map(function (action) {
          return action.fold(
            Fun.curry(deleteTableElement, editor),
            Fun.curry(emptyCells, editor)
          );
        }).getOr(false);
    };

    var deleteRange = function (editor) {
      var rootNode = Element.fromDom(editor.getBody());
      var rng = editor.selection.getRng();
      var selectedCells = TableCellSelection.getCellsFromEditor(editor);

      return selectedCells.length !== 0 ? emptyCells(editor, selectedCells) : handleCellRange(editor, rootNode, rng);
    };

    var backspaceDelete = function (editor) {
      return editor.selection.isCollapsed() ? false : deleteRange(editor);
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
