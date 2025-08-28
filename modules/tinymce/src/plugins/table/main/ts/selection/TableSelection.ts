/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/table/selection/TableSelection.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { TableSelection } from '@ephox/darwin';
import { Arr, Fun, Optionals } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Attribute, Compare, SelectorFind, SugarElement, SugarElements, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { ephemera } from './Ephemera';

const getSelectionCellFallback = (element: SugarElement<Node>) =>
  TableLookup.table(element).bind((table) =>
    TableSelection.retrieve(table, ephemera.firstSelectedSelector)
  ).fold(Fun.constant(element), (cells) => cells[0]);

const getSelectionFromSelector = <T extends Element>(selector: string) =>
  (initCell: SugarElement<Node>, isRoot?: (el: SugarElement<Node>) => boolean) => {
    const cellName = SugarNode.name(initCell);
    const cell = cellName === 'col' || cellName === 'colgroup' ? getSelectionCellFallback(initCell) : initCell;
    return SelectorFind.closest<T>(cell, selector, isRoot);
  };

const getSelectionCellOrCaption = getSelectionFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption');

const getSelectionCell = getSelectionFromSelector<HTMLTableCellElement>('th,td');

const getCellsFromSelection = (editor: Editor): SugarElement<HTMLTableCellElement>[] =>
  SugarElements.fromDom(editor.model.table.getSelectedCells());

const getRowsFromSelection = (selected: SugarElement<Node>, selector: string): SugarElement<HTMLTableRowElement>[] => {
  const cellOpt = getSelectionCell(selected);
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
  getSelectionCell,
  getSelectionCellOrCaption,
  getRowsFromSelection,
  getCellsFromSelection
};
