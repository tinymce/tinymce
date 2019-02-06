import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Warehouse from '../model/Warehouse';

// Returns the sum of elements of measures in the half-open range [start, end)
// Measures is in pixels, treated as an array of integers or integers in string format.
// NOTE: beware of accumulated rounding errors over multiple columns - could result in noticeable table width changes
var total = function (start, end, measures) {
  var r = 0;
  for (var i = start; i < end; i++) {
    r += measures[i] !== undefined ? measures[i] : 0;
  }
  return r;
};

// Returns an array of all cells in warehouse with updated cell-widths, using
// the array 'widths' of the representative widths of each column of the table 'warehouse'
var recalculateWidth = function (warehouse, widths) {
  var all = Warehouse.justCells(warehouse);

  return Arr.map(all, function (cell) {
    // width of a spanning cell is sum of widths of representative columns it spans
    var width = total(cell.column(), cell.column() + cell.colspan(), widths);
    return {
      element: cell.element,
      width: Fun.constant(width),
      colspan: cell.colspan
    };
  });
};

var recalculateHeight = function (warehouse, heights) {
  var all = Warehouse.justCells(warehouse);
  return Arr.map(all, function (cell) {
    var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
    return {
      element: cell.element,
      height: Fun.constant(height),
      rowspan: cell.rowspan
    };
  });
};

var matchRowHeight = function (warehouse, heights) {
  return Arr.map(warehouse.all(), function (row, i) {
    return {
      element: row.element,
      height: Fun.constant(heights[i])
    };
  });
};

export default {
  recalculateWidth: recalculateWidth,
  recalculateHeight: recalculateHeight,
  matchRowHeight: matchRowHeight
};