/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option, Options } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as CellOperations from '../queries/CellOperations';
import * as Ephemera from './Ephemera';
import { Selections } from './Selections';

const getSelectionStartFromSelector = <T extends Element>(selector: string) => (editor: Editor) =>
  Option.from(editor.dom.getParent<T>(editor.selection.getStart(), selector)).map((n) => SugarElement.fromDom(n));

const getSelectionStartCaption = getSelectionStartFromSelector<HTMLTableCaptionElement>('caption');

const getSelectionStartCell = getSelectionStartFromSelector<HTMLTableCellElement>('th,td');

const getSelectionStartCellOrCaption = getSelectionStartFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption');

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

export { getSelectionStartCaption, getSelectionStartCell, getSelectionStartCellOrCaption, getCellsFromSelection, getRowsFromSelection };

