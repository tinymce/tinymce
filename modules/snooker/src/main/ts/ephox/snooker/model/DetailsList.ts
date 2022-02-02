import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { getAttrValue } from '../util/CellUtils';

const fromRowsOrColGroups = (elems: SugarElement<HTMLTableRowElement | HTMLTableColElement>[], getSection: (group: SugarElement<HTMLElement>) => Structs.Section): Structs.RowDetail<Structs.Detail>[] =>
  Arr.map(elems, (row) => {
    if (SugarNode.name(row) === 'colgroup') {
      const cells = Arr.map(TableLookup.columns(row), (column) => {
        const colspan = getAttrValue(column, 'span', 1);
        return Structs.detail(column, 1, colspan);
      });
      return Structs.rowdetail(row, cells, 'colgroup');
    } else {
      const cells = Arr.map(TableLookup.cells(row), (cell) => {
        const rowspan = getAttrValue(cell, 'rowspan', 1);
        const colspan = getAttrValue(cell, 'colspan', 1);
        return Structs.detail(cell, rowspan, colspan);
      });

      return Structs.rowdetail(row, cells, getSection(row));
    }
  });

const getParentSection = (group: SugarElement<HTMLElement>): Structs.Section =>
  Traverse.parent(group).map((parent) => {
    const parentName = SugarNode.name(parent);
    return Structs.isValidSection(parentName) ? parentName : 'tbody';
  }).getOr('tbody');

/*
 * Takes a DOM table and returns a list of list of:
   element: row element
   cells: (id, rowspan, colspan) structs
 */
const fromTable = (table: SugarElement<HTMLTableElement>): Structs.RowDetail<Structs.Detail>[] => {
  const rows = TableLookup.rows(table);
  const columnGroups = TableLookup.columnGroups(table);

  const elems: SugarElement<HTMLTableRowElement | HTMLTableColElement>[] = [ ...columnGroups, ...rows ];
  return fromRowsOrColGroups(elems, getParentSection);
};

const fromPastedRows = (elems: SugarElement<HTMLTableRowElement | HTMLTableColElement>[], section: Structs.Section): Structs.RowDetail<Structs.Detail>[] =>
  fromRowsOrColGroups(elems, () => section);

export {
  fromTable,
  fromPastedRows
};
