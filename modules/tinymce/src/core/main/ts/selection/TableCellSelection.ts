import { Arr, Optional } from '@ephox/katamari';
import { SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as ElementType from '../dom/ElementType';
import * as MultiRange from './MultiRange';

const getCellsFromRanges = (ranges: Range[]): SugarElement<HTMLTableCellElement>[] =>
  Arr.filter(MultiRange.getSelectedNodes(ranges), ElementType.isTableCell);

const getCellsFromElement = (elm: SugarElement<Element>): SugarElement<HTMLTableCellElement>[] =>
  SelectorFilter.descendants<HTMLTableCellElement>(elm, 'td[data-mce-selected],th[data-mce-selected]');

const getCellsFromElementOrRanges = (ranges: Range[], element: SugarElement<Element>): SugarElement<HTMLTableCellElement>[] => {
  const selectedCells = getCellsFromElement(element);
  return selectedCells.length > 0 ? selectedCells : getCellsFromRanges(ranges);
};

const getCellsFromEditor = (editor: Editor): SugarElement<HTMLTableCellElement>[] =>
  getCellsFromElementOrRanges(MultiRange.getRanges(editor.selection.getSel()), SugarElement.fromDom(editor.getBody()));

const getClosestTable = (cell: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean): Optional<SugarElement<HTMLTableElement>> =>
  SelectorFind.ancestor<HTMLTableElement>(cell, 'table', isRoot);

export {
  getCellsFromRanges,
  getCellsFromElement,
  getCellsFromElementOrRanges,
  getCellsFromEditor,
  getClosestTable
};
