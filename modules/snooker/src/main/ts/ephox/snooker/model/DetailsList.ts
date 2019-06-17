import { Arr } from '@ephox/katamari';
import { Attr, Node, Traverse, Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';

/*
 * Takes a DOM table and returns a list of list of:
   element: row element
   cells: (id, rowspan, colspan) structs
 */
const fromTable = function (table: Element) {
  const rows = TableLookup.rows(table);
  return Arr.map(rows, function (row) {
    const element = row;

    const parent = Traverse.parent(element);
    const parentSection = parent.map(function (p) {
      const parentName = Node.name(p);
      return (parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody') ? parentName : 'tbody';
    }).getOr('tbody');

    const cells = Arr.map(TableLookup.cells(row), function (cell) {
      const rowspan = Attr.has(cell, 'rowspan') ? parseInt(Attr.get(cell, 'rowspan'), 10) : 1;
      const colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(element, cells, parentSection);
  });
};

const fromPastedRows = function (rows: Element[], example: Structs.RowCells) {
  return Arr.map(rows, function (row) {
    const cells = Arr.map(TableLookup.cells(row), function (cell) {
      const rowspan = Attr.has(cell, 'rowspan') ? parseInt(Attr.get(cell, 'rowspan'), 10) : 1;
      const colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(row, cells, example.section());
  });
};

export default {
  fromTable,
  fromPastedRows
};