/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { CellOpSelection, Selections, TableSelection } from '@ephox/darwin';
import { Arr, Fun, Optionals } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Attribute, Compare, SelectorFind, SugarElement, SugarElements, SugarNode } from '@ephox/sugar';

import { ephemera } from './Ephemera';

const getSelectionCellFallback = (element: SugarElement<Node>, takeLast: boolean) =>
  TableLookup.table(element).bind((table) =>
    TableSelection.retrieve(table, ephemera.firstSelectedSelector)
  ).fold(
    Fun.constant(element),
    (cells) => takeLast ? cells[cells.length - 1] : cells[0]);

const getSelectionFromSelector = <T extends Element>(selector: string, takeLast: boolean) =>
  (initCell: SugarElement<Node>, isRoot?: (el: SugarElement<Node>) => boolean) => {
    const cellName = SugarNode.name(initCell);
    const cell = cellName === 'col' || cellName === 'colgroup' ? getSelectionCellFallback(initCell, takeLast) : initCell;
    return SelectorFind.closest<T>(cell, selector, isRoot);
  };

const getSelectionStartCaption = getSelectionFromSelector<HTMLTableCaptionElement>('caption', false);

const getSelectionStartCell = getSelectionFromSelector<HTMLTableCellElement>('th,td', false);

const getSelectionStartCellOrCaption = getSelectionFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption', false);

const getSelectionEndCellOrCaption = getSelectionFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption', false);

const getCellsFromSelection = (start: SugarElement<Node>, selections: Selections, isRoot?: (el: SugarElement<Node>) => boolean): SugarElement<HTMLTableCellElement>[] =>
  getSelectionStartCell(start, isRoot)
    .map((_cell) => CellOpSelection.selection(selections))
    .getOr([]);

const getRowsFromSelection = (start: SugarElement<Node>, selector: string): SugarElement<HTMLTableRowElement>[] => {
  const cellOpt = getSelectionStartCell(start);
  const rowsOpt = cellOpt.bind((cell) => TableLookup.table(cell))
    .map((table) => TableLookup.rows(table));
  return Optionals.lift2(cellOpt, rowsOpt, (cell, rows) =>
    Arr.filter(rows, (row) =>
      Arr.exists(SugarElements.fromDom(row.dom.cells), (rowCell) =>
        Attribute.get(rowCell, selector) === '1' || Compare.eq(rowCell, cell)
      )
    )
  ).getOr([]);
};

export {
  getSelectionStartCaption,
  getSelectionStartCell,
  getSelectionStartCellOrCaption,
  getSelectionEndCellOrCaption,
  getCellsFromSelection,
  getRowsFromSelection
};
