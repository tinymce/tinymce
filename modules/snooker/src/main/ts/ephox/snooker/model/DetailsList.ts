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
      return (parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody') ? parentName : 'tbody';
    }).getOr('tbody');

    const cells = Arr.map(TableLookup.cells(row), (cell) => {
      const rowspan = getAttrValue(cell, 'rowspan', 1);
      const colspan = getAttrValue(cell, 'colspan', 1);
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(row, cells, parentSection, false);
  });

  const tableColumnGroups = Arr.map(columnGroups, (group) => {
    const parentOptional = Traverse.parent(group);
    const parentSection = parentOptional.map((parent) => {
      const parentName = SugarNode.name(parent);
      return (parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody') ? parentName : 'tbody';
    }).getOr('tbody');

    const cells = Arr.map(TableLookup.groups(group), (cell) => {
      const rowspan = getAttrValue(cell, 'rowspan', 1);
      const colspan = getAttrValue(cell, 'colspan', 1);
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(group, cells, parentSection, true);
  });

  return tableRows.concat(tableColumnGroups);
};

const fromPastedRows = function (rows: SugarElement[], example: Structs.RowCells) {
  return Arr.map(rows, function (row) {
    const cells = Arr.map(TableLookup.cells(row), function (cell) {
      const rowspan = getAttrValue(cell, 'rowspan', 1);
      const colspan = getAttrValue(cell, 'colspan', 1);
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(row, cells, example.section, false);
  });
};

export {
  fromTable,
  fromPastedRows
};
