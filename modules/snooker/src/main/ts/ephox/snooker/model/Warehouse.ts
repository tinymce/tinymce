import { Arr, Fun, Option } from '@ephox/katamari';
import Structs from '../api/Structs';

const key = function (row, column) {
  return row + ',' + column;
};

const getAt = function (warehouse, row, column) {
  const raw = warehouse.access()[key(row, column)];
  return raw !== undefined ? Option.some(raw) : Option.none();
};

const findItem = function (warehouse, item, comparator) {
  const filtered = filterItems(warehouse, function (detail) {
    return comparator(item, detail.element());
  });

  return filtered.length > 0 ? Option.some(filtered[0]) : Option.none();
};

const filterItems = function (warehouse, predicate) {
  const all = Arr.bind(warehouse.all(), function (r) { return r.cells(); });
  return Arr.filter(all, predicate);
};

/*
 * From a list of list of Detail, generate three pieces of information:
 *  1. the grid size
 *  2. a data structure which can efficiently identify which cell is in which row,column position
 *  3. a list of all cells in order left-to-right, top-to-bottom
 */
const generate = function (list) {
  // list is an array of objects, made by cells and elements
  // elements: is the TR
  // cells: is an array of objects representing the cells in the row.
  //        It is made of:
  //          colspan (merge cell)
  //          element
  //          rowspan (merge cols)
  const access: Record<string, ReturnType<typeof Structs.extended>> = {};
  const cells = [];

  const maxRows = list.length;
  let maxColumns = 0;

  Arr.each(list, function (details, r) {
    const currentRow = [];
    Arr.each(details.cells(), function (detail, c) {
      let start = 0;

      // If this spot has been taken by a previous rowspan, skip it.
      while (access[key(r, start)] !== undefined) {
        start++;
      }

      const current = Structs.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);

      // Occupy all the (row, column) positions that this cell spans for.
      for (let i = 0; i < detail.colspan(); i++) {
        for (let j = 0; j < detail.rowspan(); j++) {
          const cr = r + j;
          const cc = start + i;
          const newpos = key(cr, cc);
          access[newpos] = current;
          maxColumns = Math.max(maxColumns, cc + 1);
        }
      }

      currentRow.push(current);
    });

    cells.push(Structs.rowdata(details.element(), currentRow, details.section()));
  });

  const grid = Structs.grid(maxRows, maxColumns);

  return {
    grid: Fun.constant(grid),
    access: Fun.constant(access),
    all: Fun.constant(cells)
  };
};

const justCells = function (warehouse) {
  const rows = Arr.map(warehouse.all(), function (w) {
    return w.cells();
  });

  return Arr.flatten(rows);
};

export default {
  generate,
  getAt,
  findItem,
  filterItems,
  justCells
};