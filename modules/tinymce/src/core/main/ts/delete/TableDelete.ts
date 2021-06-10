/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Compare, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isAfterTable, isBeforeTable } from '../caret/CaretPositionPredicates';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as PaddingBr from '../dom/PaddingBr';
import * as Parents from '../dom/Parents';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as DeleteElement from './DeleteElement';
import * as TableDeleteAction from './TableDeleteAction';

const freefallRtl = (root: SugarElement<Node>): Optional<SugarElement<Node>> => {
  const child = SugarNode.isComment(root) ? Traverse.prevSibling(root) : Traverse.lastChild(root);
  return child.bind(freefallRtl).orThunk(() => Optional.some(root));
};

const isRootFromElement = (root: SugarElement<any>) =>
  (cur: SugarElement<any>): boolean => Compare.eq(root, cur);

const getTableDetailsFromRange = (editor: Editor, rng: Range) => {
  const isRoot = isRootFromElement(SugarElement.fromDom(editor.getBody()));
  const getTable = (elm: SugarElement<Node>) => TableCellSelection.getClosestTable(elm, isRoot);
  const startTable = getTable(SugarElement.fromDom(rng.startContainer));
  const endTable = getTable(SugarElement.fromDom(rng.endContainer));
  const startInTable = startTable.isSome();
  const endInTable = endTable.isSome();
  // Partial selection - selection is not within the same table
  const partialSelection = Optionals.lift2(startTable, endTable, (startTable, endTable) => !Compare.eq(startTable, endTable)).getOr(true);
  const multiTableSelection = partialSelection && startInTable && endInTable;

  return {
    startTable,
    endTable,
    startInTable,
    endInTable,
    partialSelection,
    multiTableSelection
  };
};

const unSelectCells = (rng: Range, startTableOpt: Optional<SugarElement<HTMLTableElement>>, endTableOpt: Optional<SugarElement<HTMLTableElement>>) => {
  const sameTable = Optionals.lift2(startTableOpt, endTableOpt, (startTable, endTable) => Compare.eq(startTable, endTable)).getOr(false);
  if (!sameTable) {
    startTableOpt.each((startTable) => rng.setStartAfter(startTable.dom));
    endTableOpt.each((endTable) => rng.setEndBefore(endTable.dom));
  } else if (startTableOpt.isSome()) {
    startTableOpt.each((startTable) => rng.setStartAfter(startTable.dom));
  } else {
    endTableOpt.each((endTable) => rng.setEndBefore(endTable.dom));
  }
};

/*
 * Runs whenever cells are included in a selection
 * - the start and end of the selection is contained within the same table (called directly from deleteRange)
 * - part of a table and content outside is selected
 * - the start of the selection is in a table and the end of the selection is in another table
 */
const emptyCells = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[]) => {
  const selection = editor.selection;
  const rng = selection.getRng();
  const startContainer = rng.startContainer;
  const startOffset = rng.startOffset;
  const endContainer = rng.endContainer;
  const selectionDetails = getTableDetailsFromRange(editor, rng);
  const outsideBlock = SugarElement.fromDom(editor.dom.getParent(selectionDetails.endInTable ? startContainer : endContainer, editor.dom.isBlock));

  // Remove content from selected cells
  Arr.each(cells, PaddingBr.fillWithPaddingBr);

  // Change the selection so that the cells are no longer selected and delete the rest of the selected content
  if (selectionDetails.partialSelection) {
    unSelectCells(rng, selectionDetails.startTable, selectionDetails.endTable);
    rng.deleteContents();
  }

  // Check if the outside block is empty after the outside contents are deleted
  const isEmpty = Empty.isEmpty(outsideBlock);

  // Handle block outside the table if it is empty since rng.deleteContents leaves it
  if (selectionDetails.partialSelection && !selectionDetails.multiTableSelection && isEmpty) {
    if (selectionDetails.endInTable) {
      PaddingBr.fillWithPaddingBr(outsideBlock);
    } else {
      Remove.remove(outsideBlock);
    }
  }

  // Set the appropriate cursor location
  if (selectionDetails.multiTableSelection || selectionDetails.startInTable) {
    selection.setCursorLocation(cells[0].dom, 0);
  } else if (isEmpty) {
    editor.selection.setCursorLocation(outsideBlock.dom, 0);
  } else {
    selection.setCursorLocation(startContainer, startOffset);
  }

  return true;
};

// Runs on a single cell table that has all of its content selected
const deleteCellContents = (editor: Editor, rng: Range, cell: SugarElement<HTMLTableCellElement>) => {
  rng.deleteContents();
  // Pad the last block node
  const lastNode = freefallRtl(cell).getOr(cell);
  const lastBlock = SugarElement.fromDom(editor.dom.getParent(lastNode.dom, editor.dom.isBlock));
  if (Empty.isEmpty(lastBlock)) {
    PaddingBr.fillWithPaddingBr(lastBlock);
    editor.selection.setCursorLocation(lastBlock.dom, 0);
  }
  // Clean up any additional leftover nodes. If the last block wasn't a direct child, then we also need to clean up siblings
  if (!Compare.eq(cell, lastBlock)) {
    const additionalCleanupNodes = Traverse.parent(lastBlock).is(cell) ? [] : Traverse.siblings(lastBlock);
    Arr.each(additionalCleanupNodes.concat(Traverse.children(cell)), (node) => {
      if (!Compare.eq(node, lastBlock) && !Compare.contains(node, lastBlock)) {
        Remove.remove(node);
      }
    });
  }
  return true;
};

const deleteTableElement = (editor: Editor, table: SugarElement<HTMLTableElement>) => {
  DeleteElement.deleteElement(editor, false, table);
  return true;
};

const deleteCellRange = (editor: Editor, rootElm: SugarElement<Node>, rng: Range) =>
  TableDeleteAction.getActionFromRange(rootElm, rng)
    .map((action) => action.fold(
      Fun.curry(deleteTableElement, editor),
      Fun.curry(emptyCells, editor),
      Fun.curry(deleteCellContents, editor)
    ));

const deleteCaptionRange = (editor: Editor, caption: SugarElement<HTMLTableCaptionElement>) => emptyElement(editor, caption);

const deleteTableRange = (editor: Editor, rootElm: SugarElement<Node>, rng: Range, startElm: SugarElement<Node>) =>
  getParentCaption(rootElm, startElm).fold(
    () => deleteCellRange(editor, rootElm, rng),
    (caption) => deleteCaptionRange(editor, caption)
  ).getOr(false);

const deleteRange = (editor: Editor, startElm: SugarElement<Node>) => {
  const rootNode = SugarElement.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  const selectedCells = TableCellSelection.getCellsFromEditor(editor);
  return selectedCells.length !== 0 ?
    emptyCells(editor, selectedCells) :
    deleteTableRange(editor, rootNode, rng, startElm);
};

const getParentCell = (rootElm: SugarElement<Node>, elm: SugarElement<Node>): Optional<SugarElement<HTMLTableCellElement>> =>
  Arr.find(Parents.parentsAndSelf(elm, rootElm), ElementType.isTableCell);

const getParentCaption = (rootElm: SugarElement<Node>, elm: SugarElement<Node>): Optional<SugarElement<HTMLTableCaptionElement>> =>
  Arr.find(Parents.parentsAndSelf(elm, rootElm), (elm) => SugarNode.name(elm) === 'caption');

const deleteBetweenCells = (editor: Editor, rootElm: SugarElement<Node>, forward: boolean, fromCell: SugarElement<HTMLTableCellElement>, from: CaretPosition) =>
  CaretFinder.navigate(forward, editor.getBody(), from)
    .bind(
      (to) => getParentCell(rootElm, SugarElement.fromDom(to.getNode()))
        .map((toCell) => Compare.eq(toCell, fromCell) === false)
    );

const emptyElement = (editor: Editor, elm: SugarElement<Node>) => {
  PaddingBr.fillWithPaddingBr(elm);
  editor.selection.setCursorLocation(elm.dom, 0);
  return Optional.some(true);
};

const isDeleteOfLastCharPos = (fromCaption: SugarElement<HTMLTableCaptionElement>, forward: boolean, from: CaretPosition, to: CaretPosition) =>
  CaretFinder.firstPositionIn(fromCaption.dom).bind(
    (first) => CaretFinder.lastPositionIn(fromCaption.dom).map(
      (last) => forward ?
        from.isEqual(first) && to.isEqual(last) :
        from.isEqual(last) && to.isEqual(first))
  ).getOr(true);

const emptyCaretCaption = (editor: Editor, elm: SugarElement<Node>) => emptyElement(editor, elm);

const validateCaretCaption = (rootElm: SugarElement<Node>, fromCaption: SugarElement<HTMLTableCaptionElement>, to: CaretPosition) =>
  getParentCaption(rootElm, SugarElement.fromDom(to.getNode()))
    .map((toCaption) => Compare.eq(toCaption, fromCaption) === false);

const deleteCaretInsideCaption = (editor: Editor, rootElm: SugarElement<Node>, forward: boolean, fromCaption: SugarElement<HTMLTableCaptionElement>, from: CaretPosition) =>
  CaretFinder.navigate(forward, editor.getBody(), from).bind(
    (to) => isDeleteOfLastCharPos(fromCaption, forward, from, to) ?
      emptyCaretCaption(editor, fromCaption) :
      validateCaretCaption(rootElm, fromCaption, to)
  ).or(Optional.some(true));

const deleteCaretCells = (editor: Editor, forward: boolean, rootElm: SugarElement<Node>, startElm: SugarElement<Node>) => {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return getParentCell(rootElm, startElm).bind(
    (fromCell) => Empty.isEmpty(fromCell) ?
      emptyElement(editor, fromCell) :
      deleteBetweenCells(editor, rootElm, forward, fromCell, from)
  ).getOr(false);
};

const deleteCaretCaption = (editor: Editor, forward: boolean, rootElm: SugarElement<Node>, fromCaption: SugarElement<HTMLTableCaptionElement>) => {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return Empty.isEmpty(fromCaption) ?
    emptyElement(editor, fromCaption) :
    deleteCaretInsideCaption(editor, rootElm, forward, fromCaption, from);
};

const isNearTable = (forward: boolean, pos: CaretPosition) =>
  forward ? isBeforeTable(pos) : isAfterTable(pos);

const isBeforeOrAfterTable = (editor: Editor, forward: boolean) => {
  const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());

  return isNearTable(forward, fromPos) ||
    CaretFinder.fromPosition(forward, editor.getBody(), fromPos)
      .exists((pos) => isNearTable(forward, pos));
};

const deleteCaret = (editor: Editor, forward: boolean, startElm: SugarElement<Node>) => {
  const rootElm = SugarElement.fromDom(editor.getBody());

  return getParentCaption(rootElm, startElm).fold(
    () => deleteCaretCells(editor, forward, rootElm, startElm) || isBeforeOrAfterTable(editor, forward),
    (fromCaption) => deleteCaretCaption(editor, forward, rootElm, fromCaption).getOr(false)
  );
};

const backspaceDelete = (editor: Editor, forward?: boolean) => {
  const startElm = SugarElement.fromDom(editor.selection.getStart(true));
  const cells = TableCellSelection.getCellsFromEditor(editor);

  return editor.selection.isCollapsed() && cells.length === 0 ?
    deleteCaret(editor, forward, startElm) :
    deleteRange(editor, startElm);
};

export {
  backspaceDelete,
  deleteCellContents
};
