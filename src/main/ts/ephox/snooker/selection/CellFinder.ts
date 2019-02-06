import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Warehouse from '../model/Warehouse';
import CellBounds from './CellBounds';
import CellGroup from './CellGroup';
import { Compare } from '@ephox/sugar';

var moveBy = function (warehouse, cell, row, column) {
  return Warehouse.findItem(warehouse, cell, Compare.eq).bind(function (detail) {
    var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
    var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
    var dest = Warehouse.getAt(warehouse, startRow + row, startCol + column);
    return dest.map(function (d) { return d.element(); });
  });
};

var intercepts = function (warehouse, start, finish) {
  return CellGroup.getAnyBox(warehouse, start, finish).map(function (bounds) {
    var inside = Warehouse.filterItems(warehouse, Fun.curry(CellBounds.inSelection, bounds));
    return Arr.map(inside, function (detail) {
      return detail.element();
    });
  });
};

var parentCell = function (warehouse, innerCell) {
  var isContainedBy = function (c1, c2) {
    return Compare.contains(c2, c1);
  };
  return Warehouse.findItem(warehouse, innerCell, isContainedBy).bind(function (detail) {
    return detail.element();
  });
};

export default {
  moveBy: moveBy,
  intercepts: intercepts,
  parentCell: parentCell
};