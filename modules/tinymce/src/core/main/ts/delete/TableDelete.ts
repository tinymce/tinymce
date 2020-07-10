/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableCaptionElement, HTMLTableCellElement, HTMLTableElement, Node as DomNode, Range } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Element, Node, Remove, Traverse } from '@ephox/sugar';
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

const freefallRtl = (root: Element<DomNode>): Option<Element<DomNode>> => {
  const child = Node.isComment(root) ? Traverse.prevSibling(root) : Traverse.lastChild(root);
  return child.bind(freefallRtl).orThunk(() => Option.some(root));
};

const emptyCells = (editor: Editor, cells: Element<HTMLTableCellElement>[]) => {
  Arr.each(cells, PaddingBr.fillWithPaddingBr);
  editor.selection.setCursorLocation(cells[0].dom(), 0);
  return true;
};

const deleteCellContents = (editor: Editor, rng: Range, cell: Element<HTMLTableCellElement>) => {
  rng.deleteContents();
  // Pad the last block node
  const lastNode = freefallRtl(cell).getOr(cell);
  const lastBlock = Element.fromDom(editor.dom.getParent(lastNode.dom(), editor.dom.isBlock));
  if (Empty.isEmpty(lastBlock)) {
    PaddingBr.fillWithPaddingBr(lastBlock);
    editor.selection.setCursorLocation(lastBlock.dom(), 0);
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

const deleteTableElement = (editor: Editor, table: Element<HTMLTableElement>) => {
  DeleteElement.deleteElement(editor, false, table);
  return true;
};

const deleteCellRange = (editor: Editor, rootElm: Element<DomNode>, rng: Range) =>
  TableDeleteAction.getActionFromRange(rootElm, rng).
    map((action) => action.fold(
      Fun.curry(deleteTableElement, editor),
      Fun.curry(emptyCells, editor),
      Fun.curry(deleteCellContents, editor)
    ));

const deleteCaptionRange = (editor: Editor, caption: Element<HTMLTableCaptionElement>) => emptyElement(editor, caption);

const deleteTableRange = (editor: Editor, rootElm: Element<DomNode>, rng: Range, startElm: Element<DomNode>) =>
  getParentCaption(rootElm, startElm).fold(
    () => deleteCellRange(editor, rootElm, rng),
    (caption) => deleteCaptionRange(editor, caption)
  ).getOr(false);

const deleteRange = (editor: Editor, startElm: Element<DomNode>) => {
  const rootNode = Element.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  const selectedCells = TableCellSelection.getCellsFromEditor(editor);
  return selectedCells.length !== 0 ?
    emptyCells(editor, selectedCells) :
    deleteTableRange(editor, rootNode, rng, startElm);
};

const getParentCell = (rootElm: Element<DomNode>, elm: Element<DomNode>): Option<Element<HTMLTableCellElement>> =>
  Arr.find(Parents.parentsAndSelf(elm, rootElm), ElementType.isTableCell);

const getParentCaption = (rootElm: Element<DomNode>, elm: Element<DomNode>): Option<Element<HTMLTableCaptionElement>> =>
  Arr.find(Parents.parentsAndSelf(elm, rootElm), (elm) => Node.name(elm) === 'caption');

const deleteBetweenCells = (editor: Editor, rootElm: Element<DomNode>, forward: boolean, fromCell: Element<HTMLTableCellElement>, from: CaretPosition) =>
  CaretFinder.navigate(forward, editor.getBody(), from).
    bind(
      (to) => getParentCell(rootElm, Element.fromDom(to.getNode())).
        map((toCell) => Compare.eq(toCell, fromCell) === false)
    );

const emptyElement = (editor: Editor, elm: Element<DomNode>) => {
  PaddingBr.fillWithPaddingBr(elm);
  editor.selection.setCursorLocation(elm.dom(), 0);
  return Option.some(true);
};

const isDeleteOfLastCharPos = (fromCaption: Element<HTMLTableCaptionElement>, forward: boolean, from: CaretPosition, to: CaretPosition) =>
  CaretFinder.firstPositionIn(fromCaption.dom()).bind(
    (first) => CaretFinder.lastPositionIn(fromCaption.dom()).map(
      (last) => forward ?
        from.isEqual(first) && to.isEqual(last) :
        from.isEqual(last) && to.isEqual(first))
  ).getOr(true);

const emptyCaretCaption = (editor: Editor, elm: Element<DomNode>) => emptyElement(editor, elm);

const validateCaretCaption = (rootElm: Element<DomNode>, fromCaption: Element<HTMLTableCaptionElement>, to: CaretPosition) =>
  getParentCaption(rootElm, Element.fromDom(to.getNode())).
    map((toCaption) => Compare.eq(toCaption, fromCaption) === false);

const deleteCaretInsideCaption = (editor: Editor, rootElm: Element<DomNode>, forward: boolean, fromCaption: Element<HTMLTableCaptionElement>, from: CaretPosition) =>
  CaretFinder.navigate(forward, editor.getBody(), from).bind(
    (to) => isDeleteOfLastCharPos(fromCaption, forward, from, to) ?
      emptyCaretCaption(editor, fromCaption) :
      validateCaretCaption(rootElm, fromCaption, to)
  ).or(Option.some(true));

const deleteCaretCells = (editor: Editor, forward: boolean, rootElm: Element<DomNode>, startElm: Element<DomNode>) => {
  const from = CaretPosition.fromRangeStart(editor.selection.getRng());
  return getParentCell(rootElm, startElm).bind(
    (fromCell) => Empty.isEmpty(fromCell) ?
      emptyElement(editor, fromCell) :
      deleteBetweenCells(editor, rootElm, forward, fromCell, from)
  ).getOr(false);
};

const deleteCaretCaption = (editor: Editor, forward: boolean, rootElm: Element<DomNode>, fromCaption: Element<HTMLTableCaptionElement>) => {
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

const deleteCaret = (editor: Editor, forward: boolean, startElm: Element<DomNode>) => {
  const rootElm = Element.fromDom(editor.getBody());

  return getParentCaption(rootElm, startElm).fold(
    () => deleteCaretCells(editor, forward, rootElm, startElm) || isBeforeOrAfterTable(editor, forward),
    (fromCaption) => deleteCaretCaption(editor, forward, rootElm, fromCaption).getOr(false)
  );
};

const backspaceDelete = (editor: Editor, forward?: boolean) => {
  const startElm = Element.fromDom(editor.selection.getStart(true));
  const cells = TableCellSelection.getCellsFromEditor(editor);

  return editor.selection.isCollapsed() && cells.length === 0 ?
    deleteCaret(editor, forward, startElm) :
    deleteRange(editor, startElm);
};

export {
  backspaceDelete,
  deleteCellContents
};
