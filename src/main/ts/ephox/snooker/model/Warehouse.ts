import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Structs from '../api/Structs';

var key = function (row, column) {
  return row + ',' + column;
};

var getAt = function (warehouse, row, column) {
  var raw = warehouse.access()[key(row, column)];
  return raw !== undefined ? Option.some(raw) : Option.none();
};

var findItem = function (warehouse, item, comparator) {
  var filtered = filterItems(warehouse, function (detail) {
    return comparator(item, detail.element());
  });

  return filtered.length > 0 ? Option.some(filtered[0]) : Option.none();
};

var filterItems = function (warehouse, predicate) {
  var all = Arr.bind(warehouse.all(), function (r) { return r.cells(); });
  return Arr.filter(all, predicate);
};

/*
 * From a list of list of Detail, generate three pieces of information:
 *  1. the grid size
 *  2. a data structure which can efficiently identify which cell is in which row,column position
 *  3. a list of all cells in order left-to-right, top-to-bottom
 */
var generate = function (list) {
  // list is an array of objects, made by cells and elements
  // elements: is the TR
  // cells: is an array of objects representing the cells in the row.
  //        It is made of:
  //          colspan (merge cell)
  //          element
  //          rowspan (merge cols)
  var access: Record<any, any> = {};
  var cells = [];

  var maxRows = list.length;
  var maxColumns = 0;

  Arr.each(list, function (details, r) {
    var currentRow = [];
    Arr.each(details.cells(), function (detail, c) {
      var start = 0;

      // If this spot has been taken by a previous rowspan, skip it.
      while (access[key(r, start)] !== undefined) {
        start++;
      }

      var current = Structs.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);

      // Occupy all the (row, column) positions that this cell spans for.
      for (var i = 0; i < detail.colspan(); i++) {
        for (var j = 0; j < detail.rowspan(); j++) {
          var cr = r + j;
          var cc = start + i;
          var newpos = key(cr, cc);
          access[newpos] = current;
          maxColumns = Math.max(maxColumns, cc + 1);
        }
      }

      currentRow.push(current);
    });

    cells.push(Structs.rowdata(details.element(), currentRow, details.section()));
  });

  var grid = Structs.grid(maxRows, maxColumns);

  return {
    grid: Fun.constant(grid),
    access: Fun.constant(access),
    all: Fun.constant(cells)
  };
};

var justCells = function (warehouse) {
  var rows = Arr.map(warehouse.all(), function (w) {
    return w.cells();
  });

  return Arr.flatten(rows);
};

export default {
  generate: generate,
  getAt: getAt,
  findItem: findItem,
  filterItems: filterItems,
  justCells: justCells
};