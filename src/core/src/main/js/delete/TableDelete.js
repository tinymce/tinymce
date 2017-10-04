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
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.delete.DeleteElement',
    'tinymce.core.delete.TableDeleteAction',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.PaddingBr',
    'tinymce.core.dom.Parents',
    'tinymce.core.selection.TableCellSelection'
  ],
  function (Arr, Fun, Option, Compare, Element, Node, CaretFinder, CaretPosition, DeleteElement, TableDeleteAction, ElementType, Empty, PaddingBr, Parents, TableCellSelection) {
    var emptyCells = function (editor, cells) {
      Arr.each(cells, PaddingBr.fillWithPaddingBr);
      editor.selection.setCursorLocation(cells[0].dom(), 0);

      return true;
    };

    var deleteTableElement = function (editor, table) {
      DeleteElement.deleteElement(editor, false, table);

      return true;
    };

    var deleteCellRange = function (editor, rootElm, rng) {
      return TableDeleteAction.getActionFromRange(rootElm, rng).map(function (action) {
        return action.fold(
          Fun.curry(deleteTableElement, editor),
          Fun.curry(emptyCells, editor)
        );
      });
    };

    var deleteCaptionRange = function (editor, caption) {
      return emptyElement(editor, caption);
    };

    var deleteTableRange = function (editor, rootElm, rng, startElm) {
      return getParentCaption(rootElm, startElm).fold(
        function () {
          return deleteCellRange(editor, rootElm, rng);
        },
        function (caption) {
          return deleteCaptionRange(editor, caption);
        }
      ).getOr(false);
    };

    var deleteRange = function (editor, startElm) {
      var rootNode = Element.fromDom(editor.getBody());
      var rng = editor.selection.getRng();
      var selectedCells = TableCellSelection.getCellsFromEditor(editor);

      return selectedCells.length !== 0 ? emptyCells(editor, selectedCells) : deleteTableRange(editor, rootNode, rng, startElm);
    };

    var getParentCell = function (rootElm, elm) {
      return Arr.find(Parents.parentsAndSelf(elm, rootElm), ElementType.isTableCell);
    };

    var getParentCaption = function (rootElm, elm) {
      return Arr.find(Parents.parentsAndSelf(elm, rootElm), function (elm) {
        return Node.name(elm) === 'caption';
      });
    };

    var deleteBetweenCells = function (editor, rootElm, forward, fromCell, from) {
      return CaretFinder.navigate(forward, editor.getBody(), from).bind(function (to) {
        return getParentCell(rootElm, Element.fromDom(to.getNode())).map(function (toCell) {
          return Compare.eq(toCell, fromCell) === false;
        });
      });
    };

    var emptyElement = function (editor, elm) {
      PaddingBr.fillWithPaddingBr(elm);
      editor.selection.setCursorLocation(elm.dom(), 0);
      return Option.some(true);
    };

    var isDeleteOfLastCharPos = function (fromCaption, forward, from, to) {
      return CaretFinder.firstPositionIn(fromCaption.dom()).bind(function (first) {
        return CaretFinder.lastPositionIn(fromCaption.dom()).map(function (last) {
          return forward ? from.isEqual(first) && to.isEqual(last) : from.isEqual(last) && to.isEqual(first);
        });
      }).getOr(true);
    };

    var emptyCaretCaption = function (editor, elm) {
      return emptyElement(editor, elm);
    };

    var validateCaretCaption = function (rootElm, fromCaption, to) {
      return getParentCaption(rootElm, Element.fromDom(to.getNode())).map(function (toCaption) {
        return Compare.eq(toCaption, fromCaption) === false;
      });
    };

    var deleteCaretInsideCaption = function (editor, rootElm, forward, fromCaption, from) {
      return CaretFinder.navigate(forward, editor.getBody(), from).bind(function (to) {
        return isDeleteOfLastCharPos(fromCaption, forward, from, to) ? emptyCaretCaption(editor, fromCaption) : validateCaretCaption(rootElm, fromCaption, to);
      }).or(Option.some(true));
    };

    var deleteCaretCells = function (editor, forward, rootElm, startElm) {
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      return getParentCell(rootElm, startElm).bind(function (fromCell) {
        return Empty.isEmpty(fromCell) ? emptyElement(editor, fromCell) : deleteBetweenCells(editor, rootElm, forward, fromCell, from);
      });
    };

    var deleteCaretCaption = function (editor, forward, rootElm, fromCaption) {
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      return Empty.isEmpty(fromCaption) ? emptyElement(editor, fromCaption) : deleteCaretInsideCaption(editor, rootElm, forward, fromCaption, from);
    };

    var deleteCaret = function (editor, forward, startElm) {
      var rootElm = Element.fromDom(editor.getBody());

      return getParentCaption(rootElm, startElm).fold(
        function () {
          return deleteCaretCells(editor, forward, rootElm, startElm);
        },
        function (fromCaption) {
          return deleteCaretCaption(editor, forward, rootElm, fromCaption);
        }
      ).getOr(false);
    };

    var backspaceDelete = function (editor, forward) {
      var startElm = Element.fromDom(editor.selection.getStart(true));
      return editor.selection.isCollapsed() ? deleteCaret(editor, forward, startElm) : deleteRange(editor, startElm);
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
