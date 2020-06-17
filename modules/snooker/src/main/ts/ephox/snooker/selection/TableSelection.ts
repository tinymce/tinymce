import { Element as DomElement, HTMLTableCellElement, HTMLTableRowElement, HTMLTableCaptionElement } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import { Selections } from './Selections';
import CellOperations from '../queries/CellOperations';

const getSelectionStartFromSelector = <T extends DomElement>(selector: string) => (editor: any) => Option.from(editor.dom.getParent(editor.selection.getStart(), selector)).map((n) => Element.fromDom(n) as Element<T>);

const getSelectionStartCaption = getSelectionStartFromSelector<HTMLTableCaptionElement>('caption');

const getSelectionStartCell = getSelectionStartFromSelector<HTMLTableCellElement>('th,td');

const getSelectionStartCellOrCaption = getSelectionStartFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption');

const getCellsFromSelection = (editor: any, selectedSelector: string): HTMLTableCellElement[] =>
  getSelectionStartCell(editor)
    .map((cell) => CellOperations.selection(cell, Selections(editor, selectedSelector)))
    .map((cells) => Arr.map(cells, (cell) => cell.dom()))
    .getOr([]);

const getRowsFromSelection = (editor: any, selector: string): HTMLTableRowElement[] => {
  const cellOpt = getSelectionStartCell(editor);
  const rowsOpt = cellOpt.bind((cell) => TableLookup.table(cell))
    .map((table) => TableLookup.rows(table))
    .map((rows) => Arr.map(rows, (row) => row.dom()));

  return Options.lift2(cellOpt, rowsOpt, (cell, rows) =>
    Arr.filter(rows, (row) => Arr.exists(row.cells, (rowCell) => editor.dom.getAttrib(rowCell, selector) === '1' || rowCell === cell.dom()))
  ).getOr([]);
};

export { getSelectionStartCaption, getSelectionStartCell, getSelectionStartCellOrCaption, getCellsFromSelection, getRowsFromSelection };

