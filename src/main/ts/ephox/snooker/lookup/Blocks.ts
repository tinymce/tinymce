import { Arr, Fun, Option } from '@ephox/katamari';
import Warehouse from '../model/Warehouse';
import Util from '../util/Util';

/*
 * Identify for each column, a cell that has colspan 1. Note, this
 * may actually fail, and future work will be to calculate column
 * sizes that are only available through the difference of two
 * spanning columns.
 */
const columns = function (warehouse) {
  const grid = warehouse.grid();
  const cols = Util.range(0, grid.columns());
  const rowsArr = Util.range(0, grid.rows());

  return Arr.map(cols, function (col) {
    const getBlock = function () {
      return Arr.bind(rowsArr, function (r) {
        return Warehouse.getAt(warehouse, r, col).filter(function (detail) {
          return detail.column() === col;
        }).fold(Fun.constant([]), function (detail) { return [ detail ]; });
      });
    };

    const isSingle = function (detail) {
      return detail.colspan() === 1;
    };

    const getFallback = function () {
      return Warehouse.getAt(warehouse, 0, col);
    };

    return decide(getBlock, isSingle, getFallback);
  });
};

const decide = function (getBlock, isSingle, getFallback) {
  const inBlock = getBlock();
  const singleInBlock = Arr.find(inBlock, isSingle);

  const detailOption = singleInBlock.orThunk(function () {
    return Option.from(inBlock[0]).orThunk(getFallback);
  });

  return detailOption.map(function (detail) { return detail.element(); });
};

const rows = function (warehouse) {
  const grid = warehouse.grid();
  const rowsArr = Util.range(0, grid.rows());
  const cols = Util.range(0, grid.columns());

  return Arr.map(rowsArr, function (row) {

    const getBlock = function () {
      return Arr.bind(cols, function (c) {
        return Warehouse.getAt(warehouse, row, c).filter(function (detail) {
          return detail.row() === row;
        }).fold(Fun.constant([]), function (detail) { return [ detail ]; });
      });
    };

    const isSingle = function (detail) {
      return detail.rowspan() === 1;
    };

    const getFallback = function () {
      return Warehouse.getAt(warehouse, row, 0);
    };

    return decide(getBlock, isSingle, getFallback);

  });

};

export default {
  columns,
  rows
};