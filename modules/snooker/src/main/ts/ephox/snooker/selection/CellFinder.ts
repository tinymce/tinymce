import { Arr, Fun } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';
import { Warehouse } from '../model/Warehouse';
import CellBounds from './CellBounds';
import CellGroup from './CellGroup';

const moveBy = function (warehouse: Warehouse, cell: Element, row: number, column: number) {
  return Warehouse.findItem(warehouse, cell, Compare.eq).bind(function (detail) {
    const startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
    const startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
    const dest = Warehouse.getAt(warehouse, startRow + row, startCol + column);
    return dest.map(function (d) { return d.element(); });
  });
};

const intercepts = function (warehouse: Warehouse, start: Element, finish: Element) {
  return CellGroup.getAnyBox(warehouse, start, finish).map(function (bounds) {
    const inside = Warehouse.filterItems(warehouse, Fun.curry(CellBounds.inSelection, bounds));
    return Arr.map(inside, function (detail) {
      return detail.element();
    });
  });
};

const parentCell = function (warehouse: Warehouse, innerCell: Element) {
  const isContainedBy = function (c1: Element, c2: Element) {
    return Compare.contains(c2, c1);
  };
  return Warehouse.findItem(warehouse, innerCell, isContainedBy).map(function (detail) {
    return detail.element();
  });
};

export default {
  moveBy,
  intercepts,
  parentCell
};