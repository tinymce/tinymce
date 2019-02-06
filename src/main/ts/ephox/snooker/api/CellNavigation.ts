import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import CellLocation from './CellLocation';
import TableLookup from './TableLookup';
import { Compare } from '@ephox/sugar';

/*
 * Identify the index of the current cell within all the cells, and
 * a list of the cells within its table.
 */
var detect = function (current, isRoot?) {
  return TableLookup.table(current, isRoot).bind(function (table) {
    var all = TableLookup.cells(table);
    var index = Arr.findIndex(all, function (x) {
      return Compare.eq(current, x);
    });

    return index.map(function (ind) {
      return {
        index: Fun.constant(ind),
        all: Fun.constant(all)
      };
    });
  });
};


/*
 * Identify the CellLocation of the cell when navigating forward from current
 */
var next = function (current, isRoot?) {
  var detection = detect(current, isRoot);
  return detection.fold(function () {
    return CellLocation.none(current);
  }, function (info) {
    return info.index() + 1 < info.all().length ? CellLocation.middle(current, info.all()[info.index() + 1]) : CellLocation.last(current);
  });
};

/*
 * Identify the CellLocation of the cell when navigating back from current
 */
var prev = function (current, isRoot?) {
  var detection = detect(current, isRoot);
  return detection.fold(function () {
    return CellLocation.none();
  }, function (info) {
    return info.index() - 1 >= 0 ? CellLocation.middle(current, info.all()[info.index() - 1]) : CellLocation.first(current);
  });
};

export default {
  next: next,
  prev: prev
};