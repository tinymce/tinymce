/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableCellElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { TableLookup } from '@ephox/snooker';
import { Selections } from '../selection/Selections';
import * as CellOperations from '../queries/CellOperations';
import * as Ephemera from './Ephemera';
import Editor from 'tinymce/core/api/Editor';

const getSelectionStartFromSelector = (selector: string) => (editor: Editor) => Option.from(editor.dom.getParent(editor.selection.getStart(), selector)).map(Element.fromDom);

const getSelectionStartCaption = getSelectionStartFromSelector('caption');

const getSelectionStartCell = getSelectionStartFromSelector('th,td');

const getSelectionStartCellOrCaption = getSelectionStartFromSelector('th,td,caption');


const getCellsFromSelection = (editor: Editor): HTMLTableCellElement[] =>
  getSelectionStartCell(editor)
    .map((cell) => CellOperations.selection(cell, Selections(editor)))
    .map((cells) => Arr.map(cells, (cell) => cell.dom()))
    .getOr([]);

const getRowsFromSelection = (editor: Editor): HTMLTableRowElement[] => {
  const cellOpt = getSelectionStartCell(editor);
  const rowsOpt = cellOpt.bind((cell) => TableLookup.table(cell))
    .map((table) => TableLookup.rows(table))
    .map((rows) => Arr.map(rows, (row) => row.dom()));

  return Options.lift2(cellOpt, rowsOpt, (cell, rows) =>
    Arr.filter(rows, (row) => Arr.exists(row.cells, (rowCell) => editor.dom.getAttrib(rowCell, Ephemera.selected) === '1' || rowCell === cell.dom()))
  ).getOr([]);
};

export {
  getSelectionStartCaption,
  getSelectionStartCell,
  getSelectionStartCellOrCaption,
  getCellsFromSelection,
  getRowsFromSelection
};
