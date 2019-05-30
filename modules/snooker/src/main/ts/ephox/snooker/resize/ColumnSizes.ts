import { Arr, Fun } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import Blocks from '../lookup/Blocks';
import CellUtils from '../util/CellUtils';
import Util from '../util/Util';
import Sizes from './Sizes';

const getRaw = function (cell, property, getter) {
  return Css.getRaw(cell, property).fold(function () {
    return getter(cell) + 'px';
  }, function (raw) {
    return raw;
  });
};

const getRawW = function (cell) {
  return getRaw(cell, 'width', Sizes.getPixelWidth);
};

const getRawH = function (cell) {
  return getRaw(cell, 'height', Sizes.getHeight);
};

const getWidthFrom: any = function (warehouse, direction, getWidth, fallback, tableSize) {
  const columns = Blocks.columns(warehouse);

  const backups = Arr.map(columns, function (cellOption) {
    return cellOption.map(direction.edge);
  });

  return Arr.map(columns, function (cellOption, c) {
    // Only use the width of cells that have no column span (or colspan 1)
    const columnCell = cellOption.filter(Fun.not(CellUtils.hasColspan));
    return columnCell.fold(function () {
      // Can't just read the width of a cell, so calculate.
      const deduced = Util.deduce(backups, c);
      return fallback(deduced);
    }, function (cell) {
      return getWidth(cell, tableSize);
    });
  });
};

const getDeduced = function (deduced) {
  return deduced.map(function (d) { return d + 'px'; }).getOr('');
};

const getRawWidths = function (warehouse, direction) {
  return getWidthFrom(warehouse, direction, getRawW, getDeduced);
};

const getPercentageWidths = function (warehouse, direction, tableSize) {
  return getWidthFrom(warehouse, direction, Sizes.getPercentageWidth, function (deduced) {
    return deduced.fold(function () {
      return tableSize.minCellWidth();
    }, function (cellWidth) {
      return cellWidth / tableSize.pixelWidth() * 100;
    });
  }, tableSize);
};

const getPixelWidths = function (warehouse, direction, tableSize) {
  return getWidthFrom(warehouse, direction, Sizes.getPixelWidth, function (deduced) {
    // Minimum cell width when all else fails.
    return deduced.getOrThunk(tableSize.minCellWidth);
  }, tableSize);
};

const getHeightFrom = function (warehouse, direction, getHeight, fallback) {
  const rows = Blocks.rows(warehouse);

  const backups = Arr.map(rows, function (cellOption) {
    return cellOption.map(direction.edge);
  });

  return Arr.map(rows, function (cellOption, c) {
    const rowCell = cellOption.filter(Fun.not(CellUtils.hasRowspan));

    return rowCell.fold(function () {
      const deduced = Util.deduce(backups, c);
      return fallback(deduced);
    }, function (cell) {
      return getHeight(cell);
    });
  });
};

const getPixelHeights = function (warehouse, direction) {
  return getHeightFrom(warehouse, direction, Sizes.getHeight, function (deduced) {
    return deduced.getOrThunk(CellUtils.minHeight);
  });
};

const getRawHeights = function (warehouse, direction) {
  return getHeightFrom(warehouse, direction, getRawH, getDeduced);
};

export default {
  getRawWidths,
  getPixelWidths,
  getPercentageWidths,
  getPixelHeights,
  getRawHeights
};