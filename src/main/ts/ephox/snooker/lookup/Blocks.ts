import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Warehouse from '../model/Warehouse';
import Util from '../util/Util';

/*
 * Identify for each column, a cell that has colspan 1. Note, this
 * may actually fail, and future work will be to calculate column
 * sizes that are only available through the difference of two
 * spanning columns.
 */
var columns = function (warehouse) {
  var grid = warehouse.grid();
  var cols = Util.range(0, grid.columns());
  var rows = Util.range(0, grid.rows());

  return Arr.map(cols, function (col) {
    var getBlock = function () {
      return Arr.bind(rows, function (r) {
        return Warehouse.getAt(warehouse, r, col).filter(function (detail) {
          return detail.column() === col;
        }).fold(Fun.constant([]), function (detail) { return [ detail ]; });
      });
    };

    var isSingle = function (detail) {
      return detail.colspan() === 1;
    };

    var getFallback = function () {
      return Warehouse.getAt(warehouse, 0, col);
    };

    return decide(getBlock, isSingle, getFallback);
  });
};

var decide = function (getBlock, isSingle, getFallback) {
  var inBlock = getBlock();
  var singleInBlock = Arr.find(inBlock, isSingle);

  var detailOption = singleInBlock.orThunk(function () {
    return Option.from(inBlock[0]).orThunk(getFallback);
  });

  return detailOption.map(function (detail) { return detail.element(); });
};


var rows = function (warehouse) {
  var grid = warehouse.grid();
  var rows = Util.range(0, grid.rows());
  var cols = Util.range(0, grid.columns());

  return Arr.map(rows, function (row) {

    var getBlock = function () {
      return Arr.bind(cols, function (c) {
        return Warehouse.getAt(warehouse, row, c).filter(function (detail) {
          return detail.row() === row;
        }).fold(Fun.constant([]), function (detail) { return [ detail ]; });
      });
    };

    var isSingle = function (detail) {
      return detail.rowspan() === 1;
    };

    var getFallback = function () {
      return Warehouse.getAt(warehouse, row, 0);
    };

    return decide(getBlock, isSingle, getFallback);

  });

};

export default {
  columns: columns,
  rows: rows
};