import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { getAttrValue } from '../util/CellUtils';

const getParentSection = (group: SugarElement<HTMLElement>, fallback: Structs.Section) =>
  Traverse.parent(group).map((parent) => {
    const parentName = SugarNode.name(parent);
    return Structs.isValidSection(parentName) ? parentName : fallback;
  }).getOr(fallback);

const fromRowsOrColGroups = (elems: SugarElement<HTMLTableRowElement | HTMLTableColElement>[]) =>
  Arr.map(elems, (row) => {
    if (SugarNode.name(row) === 'colgroup') {
      const cells = Arr.map(TableLookup.columns(row), (column) => {
        const colspan = getAttrValue(column, 'span', 1);
        return Structs.detail(column, 1, colspan);
      });
      return Structs.rowdata(row, cells, 'colgroup');
    } else {
      const cells = Arr.map(TableLookup.cells(row), (cell) => {
        const rowspan = getAttrValue(cell, 'rowspan', 1);
        const colspan = getAttrValue(cell, 'colspan', 1);
        return Structs.detail(cell, rowspan, colspan);
      });

      const parentSection = getParentSection(row, 'tbody');
      return Structs.rowdata(row, cells, parentSection);
    }
  });

/*
 * Takes a DOM table and returns a list of list of:
   element: row element
   cells: (id, rowspan, colspan) structs
 */
const fromTable = (table: SugarElement<HTMLTableElement>) => {
  const rows = TableLookup.rows(table);
  const columnGroups = TableLookup.columnGroups(table);

  const elems: SugarElement<HTMLTableRowElement | HTMLTableColElement>[] = [ ...columnGroups, ...rows ];
  return fromRowsOrColGroups(elems);
};

const fromPastedRows = fromRowsOrColGroups;

export {
  fromTable,
  fromPastedRows
};
