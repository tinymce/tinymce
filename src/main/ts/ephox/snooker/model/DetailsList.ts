import { Arr } from '@ephox/katamari';
import Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';
import { Attr } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

/*
 * Takes a DOM table and returns a list of list of:
   element: row element
   cells: (id, rowspan, colspan) structs
 */
var fromTable = function (table) {
  var rows = TableLookup.rows(table);
  return Arr.map(rows, function (row) {
    var element = row;

    var parent = Traverse.parent(element);
    var parentSection = parent.map(function (parent) {
      var parentName = Node.name(parent);
      return (parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody') ? parentName : 'tbody';
    }).getOr('tbody');

    var cells = Arr.map(TableLookup.cells(row), function (cell) {
      var rowspan = Attr.has(cell, 'rowspan') ? parseInt(Attr.get(cell, 'rowspan'), 10) : 1;
      var colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(element, cells, parentSection);
  });
};

var fromPastedRows = function (rows, example) {
  return Arr.map(rows, function (row) {
    var cells = Arr.map(TableLookup.cells(row), function (cell) {
      var rowspan = Attr.has(cell, 'rowspan') ? parseInt(Attr.get(cell, 'rowspan'), 10) : 1;
      var colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
      return Structs.detail(cell, rowspan, colspan);
    });

    return Structs.rowdata(row, cells, example.section());
  });
};

export default {
  fromTable: fromTable,
  fromPastedRows: fromPastedRows
};