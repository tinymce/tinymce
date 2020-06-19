import { Element as DomElement, HTMLTableCellElement, HTMLTableRowElement, HTMLTableCaptionElement, Node } from '@ephox/dom-globals';
import { Arr, Options } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Attr, Compare, Element, Elements, SelectorFind } from '@ephox/sugar';
import { Selections } from './Selections';
import CellOperations from '../queries/CellOperations';

const getSelectionStartFromSelector = <T extends DomElement>(selector: string) => (start: Element<Node>) =>
  SelectorFind.closest<T>(start, selector);

const getSelectionStartCaption = getSelectionStartFromSelector<HTMLTableCaptionElement>('caption');

const getSelectionStartCell = getSelectionStartFromSelector<HTMLTableCellElement>('th,td');

const getSelectionStartCellOrCaption = getSelectionStartFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption');

const getCellsFromSelection = (body: any, start: Element<Node>, selectedSelector: string): Element<HTMLTableCellElement>[] =>
  getSelectionStartCell(start)
    .map((cell) => CellOperations.selection(cell, Selections(body, () => start, selectedSelector)))
    .getOr([]);

const getRowsFromSelection = (start: Element<Node>, selector: string): Element<HTMLTableRowElement>[] => {
  const cellOpt = getSelectionStartCell(start);
  const rowsOpt = cellOpt.bind((cell) => TableLookup.table(cell))
    .map((table) => TableLookup.rows(table));
  return Options.lift2(cellOpt, rowsOpt, (cell, rows) =>
    Arr.filter(rows, (row) =>
      Arr.exists(Elements.fromDom(row.dom().cells), (rowCell) =>
        Attr.get(rowCell, selector) === '1' || Compare.eq(rowCell, cell)
      )
    )
  ).getOr([]);
};
export { getSelectionStartCaption, getSelectionStartCell, getSelectionStartCellOrCaption, getCellsFromSelection, getRowsFromSelection };