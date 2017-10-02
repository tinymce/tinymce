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
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.delete.DeleteElement',
    'tinymce.core.delete.TableDeleteAction',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.PaddingBr',
    'tinymce.core.dom.Parents',
    'tinymce.core.selection.TableCellSelection'
  ],
  function (Arr, Fun, Compare, Element, CaretFinder, CaretPosition, DeleteElement, TableDeleteAction, ElementType, PaddingBr, Parents, TableCellSelection) {
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

    var getParentCell = function (rootElm, elm) {
      return Arr.find(Parents.parentsAndSelf(elm, rootElm), ElementType.isTableCell);
    };

    var deleteCaret = function (editor, forward) {
      var rootElm = Element.fromDom(editor.getBody());
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      return getParentCell(rootElm, Element.fromDom(editor.selection.getStart(true))).bind(function (fromCell) {
        return CaretFinder.navigate(forward, editor.getBody(), from).bind(function (to) {
          return getParentCell(rootElm, Element.fromDom(to.getNode())).map(function (toCell) {
            return Compare.eq(toCell, fromCell) === false;
          });
        });
      }).getOr(false);
    };

    var backspaceDelete = function (editor, forward) {
      return editor.selection.isCollapsed() ? deleteCaret(editor, forward) : deleteRange(editor);
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
