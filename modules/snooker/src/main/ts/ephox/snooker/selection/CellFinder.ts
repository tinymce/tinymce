import { Arr, Fun } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';
import { Warehouse } from '../api/Warehouse';
import * as CellBounds from './CellBounds';
import * as CellGroup from './CellGroup';

const moveBy = function (warehouse: Warehouse, cell: SugarElement, row: number, column: number) {
  return Warehouse.findItem(warehouse, cell, Compare.eq).bind(function (detail) {
    const startRow = row > 0 ? detail.row + detail.rowspan - 1 : detail.row;
    const startCol = column > 0 ? detail.column + detail.colspan - 1 : detail.column;
    const dest = Warehouse.getAt(warehouse, startRow + row, startCol + column);
    return dest.map(function (d) { return d.element; });
  });
};

const intercepts = function (warehouse: Warehouse, start: SugarElement, finish: SugarElement) {
  return CellGroup.getAnyBox(warehouse, start, finish).map(function (bounds) {
    const inside = Warehouse.filterItems(warehouse, Fun.curry(CellBounds.inSelection, bounds));
    return Arr.map(inside, function (detail) {
      return detail.element;
    });
  });
};

const parentCell = function (warehouse: Warehouse, innerCell: SugarElement) {
  const isContainedBy = function (c1: SugarElement, c2: SugarElement) {
    return Compare.contains(c2, c1);
  };
  return Warehouse.findItem(warehouse, innerCell, isContainedBy).map(function (detail) {
    return detail.element;
  });
};

export {
  moveBy,
  intercepts,
  parentCell
};
