/**
 * TableDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Element, Node } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import DeleteElement from './DeleteElement';
import TableDeleteAction from './TableDeleteAction';
import * as ElementType from '../dom/ElementType';
import Empty from '../dom/Empty';
import PaddingBr from '../dom/PaddingBr';
import Parents from '../dom/Parents';
import TableCellSelection from '../selection/TableCellSelection';

const emptyCells = function (editor, cells) {
  Arr.each(cells, PaddingBr.fillWithPaddingBr);
  editor.selection.setCursorLocation(cells[0].dom(), 0);

  return true;
};

const deleteTableElement = function (editor, table) {
  DeleteElement.deleteElement(editor, false, table);

  return true;
};

const deleteCellRange = function (editor, rootElm, rng) {
  return TableDeleteAction.getActionFromRange(rootElm, rng).map(function (action) {
    return action.fold(
      Fun.curry(deleteTableElement, editor),
      Fun.curry(emptyCells, editor)
    );
  });
};

const deleteCaptionRange = function (editor, caption) {
  return emptyElement(editor, caption);
};

const deleteTableRange = function (editor, rootElm, rng, startElm) {
  return getParentCaption(rootElm, startElm).fold(
    function () {
      return deleteCellRange(editor, rootElm, rng);
    },
    function (caption) {
      return deleteCaptionRange(editor, caption);
    }
  ).getOr(false);
};

const deleteRange = function (editor, startElm) {
  const rootNode = Element.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  const selectedCells = TableCellSelection.getCellsFromEditor(editor);

  return selectedCells.length !== 0 ? emptyCells(editor, selectedCells) : deleteTableRange(editor, rootNode, rng, startElm);
};

const getParentCell = function (rootElm, elm) {
  return Arr.find(Parents.parentsAndSelf(elm, rootElm), ElementType.isTableCell);
};

const getParentCaption = function (rootElm, elm) {
  return Arr.find(Parents.parentsAndSelf(elm, rootElm), function (elm) {
    return Node.name(elm) === 'caption';
  });
};

const deleteBetweenCells = function (editor, rootElm, forward, fromCell, from) {
  return CaretFinder.navigate(forward, editor.getBody(), from).bind(function (to) {
    return getParentCell(rootElm, Element.fromDom(to.getNode())).map(function (toCell) {
      return Compare.eq(toCell, fromCell) === false;
    });
  });
};

const emptyElement = function (editor, elm) {
  PaddingBr.fillWithPaddingBr(elm);
  editor.selection.setCursorLocation(elm.dom(), 0);
  return Option.some(true);
};

const isDeleteOfLastCharPos = function (fromCaption, forward, from, to) {
  return CaretFinder.firstPositionIn(fromCaption.dom()).bind(function (first) {
    return CaretFinder.lastPositionIn(fromCaption.dom()).map(function (last) {
      return forward ? from.isEqual(first) && to.isEqual(last) : from.isEqual(last) && to.isEqual(first);
    });
  }).getOr(true);
};

const emptyCaretCaption = function (editor, elm) {
  return emptyElement(editor, elm);
};

const validateCaretCaption = function (rootElm, fromCaption, to) {
  return getParentCaption(rootElm, Element.fromDom(to.getNode())).map(function (toCaption) {
    return Compare.eq(toCaption, fromCaption) === false;
  });
};

const deleteCaretInsideCaption = function (editor, rootElm, forward, fromCaption, from) {
  return CaretFinder.navigate(forward, editor.getBody(), from).bind(function (to) {
    return isDeleteOfLastCharPos(fromCaption, forward, from, to) ? emptyCaretCaption(editor, fromCaption) : validateCaretCaption(rootElm, fromCaption, to);
  }).or(Option.some(true));
};

const deleteCaretCells = function (editor, forward, rootElm, startElm) {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return getParentCell(rootElm, startElm).bind(function (fromCell) {
    return Empty.isEmpty(fromCell) ? emptyElement(editor, fromCell) : deleteBetweenCells(editor, rootElm, forward, fromCell, from);
  });
};

const deleteCaretCaption = function (editor, forward, rootElm, fromCaption) {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return Empty.isEmpty(fromCaption) ? emptyElement(editor, fromCaption) : deleteCaretInsideCaption(editor, rootElm, forward, fromCaption, from);
};

const deleteCaret = function (editor, forward, startElm) {
  const rootElm = Element.fromDom(editor.getBody());

  return getParentCaption(rootElm, startElm).fold(
    function () {
      return deleteCaretCells(editor, forward, rootElm, startElm);
    },
    function (fromCaption) {
      return deleteCaretCaption(editor, forward, rootElm, fromCaption);
    }
  ).getOr(false);
};

const backspaceDelete = function (editor, forward?) {
  const startElm = Element.fromDom(editor.selection.getStart(true));
  return editor.selection.isCollapsed() ? deleteCaret(editor, forward, startElm) : deleteRange(editor, startElm);
};

export default {
  backspaceDelete
};