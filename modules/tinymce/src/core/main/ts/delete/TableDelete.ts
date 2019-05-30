/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range } from '@ephox/dom-globals';
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
import Editor from '../api/Editor';
import { isBeforeTable, isAfterTable } from '../caret/CaretPositionPredicates';

const emptyCells = (editor: Editor, cells) => {
  Arr.each(cells, PaddingBr.fillWithPaddingBr);
  editor.selection.setCursorLocation(cells[0].dom(), 0);
  return true;
};

const deleteTableElement = (editor: Editor, table) => {
  DeleteElement.deleteElement(editor, false, table);
  return true;
};

const deleteCellRange = (editor: Editor, rootElm, rng: Range) => {
  return TableDeleteAction.getActionFromRange(rootElm, rng).map((action) => {
    return action.fold(
      Fun.curry(deleteTableElement, editor),
      Fun.curry(emptyCells, editor)
    );
  });
};

const deleteCaptionRange = (editor: Editor, caption) => emptyElement(editor, caption);

const deleteTableRange = (editor: Editor, rootElm, rng: Range, startElm) => {
  return getParentCaption(rootElm, startElm).fold(
    () => deleteCellRange(editor, rootElm, rng),
    (caption) => deleteCaptionRange(editor, caption)
  ).getOr(false);
};

const deleteRange = (editor: Editor, startElm) => {
  const rootNode = Element.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  const selectedCells = TableCellSelection.getCellsFromEditor(editor);

  return selectedCells.length !== 0 ? emptyCells(editor, selectedCells) : deleteTableRange(editor, rootNode, rng, startElm);
};

const getParentCell = (rootElm, elm) => Arr.find(Parents.parentsAndSelf(elm, rootElm), ElementType.isTableCell);

const getParentCaption = (rootElm, elm) => {
  return Arr.find(Parents.parentsAndSelf(elm, rootElm), (elm) => {
    return Node.name(elm) === 'caption';
  });
};

const deleteBetweenCells = (editor: Editor, rootElm, forward: boolean, fromCell, from: CaretPosition) => {
  return CaretFinder.navigate(forward, editor.getBody(), from).bind((to) => {
    return getParentCell(rootElm, Element.fromDom(to.getNode())).map((toCell) => {
      return Compare.eq(toCell, fromCell) === false;
    });
  });
};

const emptyElement = (editor: Editor, elm) => {
  PaddingBr.fillWithPaddingBr(elm);
  editor.selection.setCursorLocation(elm.dom(), 0);
  return Option.some(true);
};

const isDeleteOfLastCharPos = (fromCaption, forward: boolean, from: CaretPosition, to: CaretPosition) => {
  return CaretFinder.firstPositionIn(fromCaption.dom()).bind((first) => {
    return CaretFinder.lastPositionIn(fromCaption.dom()).map((last) => {
      return forward ? from.isEqual(first) && to.isEqual(last) : from.isEqual(last) && to.isEqual(first);
    });
  }).getOr(true);
};

const emptyCaretCaption = (editor: Editor, elm) => emptyElement(editor, elm);

const validateCaretCaption = (rootElm, fromCaption, to: CaretPosition) => {
  return getParentCaption(rootElm, Element.fromDom(to.getNode())).map((toCaption) => {
    return Compare.eq(toCaption, fromCaption) === false;
  });
};

const deleteCaretInsideCaption = (editor: Editor, rootElm, forward: boolean, fromCaption, from: CaretPosition) => {
  return CaretFinder.navigate(forward, editor.getBody(), from).bind((to) => {
    return isDeleteOfLastCharPos(fromCaption, forward, from, to) ? emptyCaretCaption(editor, fromCaption) : validateCaretCaption(rootElm, fromCaption, to);
  }).or(Option.some(true));
};

const deleteCaretCells = (editor: Editor, forward: boolean, rootElm, startElm) => {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return getParentCell(rootElm, startElm).bind((fromCell) => {
    return Empty.isEmpty(fromCell) ? emptyElement(editor, fromCell) : deleteBetweenCells(editor, rootElm, forward, fromCell, from);
  }).getOr(false);
};

const deleteCaretCaption = (editor: Editor, forward: boolean, rootElm, fromCaption) => {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return Empty.isEmpty(fromCaption) ? emptyElement(editor, fromCaption) : deleteCaretInsideCaption(editor, rootElm, forward, fromCaption, from);
};

const isNearTable = (forward: boolean, pos: CaretPosition) => forward ? isBeforeTable(pos) : isAfterTable(pos);

const isBeforeOrAfterTable = (editor: Editor, forward: boolean) => {
  const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());

  return isNearTable(forward, fromPos) || CaretFinder.fromPosition(forward, editor.getBody(), fromPos)
    .map((pos) => isNearTable(forward, pos))
    .getOr(false);
};

const deleteCaret = (editor: Editor, forward: boolean, startElm: Element) => {
  const rootElm = Element.fromDom(editor.getBody());

  return getParentCaption(rootElm, startElm).fold(
    () => deleteCaretCells(editor, forward, rootElm, startElm) || isBeforeOrAfterTable(editor, forward),
    (fromCaption) => deleteCaretCaption(editor, forward, rootElm, fromCaption).getOr(false)
  );
};

const backspaceDelete = (editor: Editor, forward?: boolean) => {
  const startElm = Element.fromDom(editor.selection.getStart(true));
  const cells = TableCellSelection.getCellsFromEditor(editor);

  return editor.selection.isCollapsed() && cells.length === 0 ? deleteCaret(editor, forward, startElm) : deleteRange(editor, startElm);
};

export default {
  backspaceDelete
};