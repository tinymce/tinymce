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

const removeContentFromCells = (cells: SugarElement<HTMLTableCellElement>[]) =>
  Arr.each(cells, PaddingBr.fillWithPaddingBr);

const getOutsideBlock = (editor: Editor, container: Node): Optional<SugarElement<HTMLElement>> =>
  Optional.from(editor.dom.getParent(container, editor.dom.isBlock) as HTMLElement).map(SugarElement.fromDom);

const handleEmptyBlock = (editor: Editor, startInTable: boolean, emptyBlock: Optional<SugarElement<HTMLElement>>) => {
  emptyBlock.each((block) => {
    if (startInTable) {
      // Note that we don't need to set the selection as it'll be within the table
      Remove.remove(block);
    } else {
      // Set the cursor location as it'll move when filling with padding
      PaddingBr.fillWithPaddingBr(block);
      editor.selection.setCursorLocation(block.dom, 0);
    }
  });
};

/*
 * Runs when
 * - the start and end of the selection is contained within the same table (called directly from deleteRange)
 * - part of a table and content outside is selected
 */
const emptySingleTableCells = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], outsideDetails: Optional<TableDeleteAction.OutsideTableDetails>) => {
  // Remove content from selected cells
  removeContentFromCells(cells);

  // Delete all content outside of the table that is in the selection
  outsideDetails.map(({ rng, isStartInTable }) => {
    // Get the outside block before deleting the contents
    const outsideBlock = getOutsideBlock(editor, isStartInTable ? rng.endContainer : rng.startContainer);
    rng.deleteContents();
    // Handle block outside the table if it is empty since rng.deleteContents leaves it
    handleEmptyBlock(editor, isStartInTable, outsideBlock.filter(Empty.isEmpty));
  });

  // Set the selection:
  // - to the first emptied cell if the start of the previous selection was inside a table
  // - otherwise just collapse the previous selection that started in the outside block
  const selection = editor.selection;
  if (outsideDetails.forall((details) => details.isStartInTable)) {
    selection.setCursorLocation(cells[0].dom, 0);
  } else {
    selection.collapse(true);
  }

  return true;
};

/*
 * Runs when the start of the selection is in a table and the end of the selection is in another table
 */
const emptyMultiTableCells = (editor: Editor, startTableCells: SugarElement<HTMLTableCellElement>[], endTableCells: SugarElement<HTMLTableCellElement>[], betweenRng: Range) => {
  removeContentFromCells(startTableCells.concat(endTableCells));
  // Delete all content in between the start table and end table
  betweenRng.deleteContents();
  // Set the cursor back to the start of the original selection
  editor.selection.setCursorLocation(startTableCells[0].dom, 0);
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
    const additionalCleanupNodes = Optionals.is(Traverse.parent(lastBlock), cell) ? [] : Traverse.siblings(lastBlock);
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
      Fun.curry(deleteCellContents, editor),
      Fun.curry(deleteTableElement, editor),
      Fun.curry(emptySingleTableCells, editor),
      Fun.curry(emptyMultiTableCells, editor)
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
    emptySingleTableCells(editor, selectedCells, Optional.none()) :
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
