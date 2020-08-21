import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { getAttrValue } from '../util/CellUtils';

/*
 * Takes a DOM table and returns a list of list of:
   element: row element
   cells: (id, rowspan, colspan) structs
 */
const fromTable = (table: SugarElement) => {
  const rows = TableLookup.rows(table);
  const columnGroups = TableLookup.columnGroups(table);

  const tableRows = Arr.map(rows, (row) => {
    const parent = Traverse.parent(row);
    const parentSection = parent.map((p) => {
      const parentName = SugarNode.name(p);
      return Structs.isValidSection(parentName) ? parentName : 'tbody';
    }).getOr('tbody');

    const cells = Arr.map(TableLookup.cells(row), (cell) => {
      const rowspan = getAttrValue(cell, 'rowspan', 1);
      const colspan = getAttrValue(cell, 'colspan', 1);
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(row, cells, parentSection);
  });

  const tableColumnGroups = Arr.map(columnGroups, (group) => {
    const parentSection = Traverse.parent(group).map((parent) => {
      const parentName = SugarNode.name(parent);
      return Structs.isValidSection(parentName) ? parentName : 'colgroup';
    }).getOr('colgroup');

    const cells = Arr.map(TableLookup.columns(group), (column) => {
      const rowspan = getAttrValue(column, 'rowspan', 1);
      const colspan = getAttrValue(column, 'colspan', 1);
      return Structs.detail(column, rowspan, colspan);
    });

    return Structs.rowdata(group, cells, parentSection);
  });

  return tableRows.concat(tableColumnGroups);
};

const fromPastedRows = (rows: SugarElement[], example: Structs.RowCells) =>
  Arr.map(rows, (row) => {
    const cells = Arr.map(TableLookup.cells(row), (cell) => {
      const rowspan = getAttrValue(cell, 'rowspan', 1);
      const colspan = getAttrValue(cell, 'colspan', 1);
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(row, cells, example.section);
  });

export {
  fromTable,
  fromPastedRows
};
