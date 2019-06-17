import { Arr, Fun, Option } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';
import Blocks from '../lookup/Blocks';
import CellUtils from '../util/CellUtils';
import * as Util from '../util/Util';
import Sizes from './Sizes';
import { Warehouse } from '../model/Warehouse';
import { TableSize } from './Types';
import { BarPositions, RowInfo, ColInfo } from './BarPositions';

const getRaw = function (cell: Element, property: string, getter: (e: Element) => number) {
  return Css.getRaw(cell, property).fold(function () {
    return getter(cell) + 'px';
  }, function (raw) {
    return raw;
  });
};

const getRawW = function (cell: Element, tableSize: TableSize) {
  return getRaw(cell, 'width', (e: Element) => Sizes.getPixelWidth(e, tableSize));
};

const getRawH = function (cell: Element) {
  return getRaw(cell, 'height', Sizes.getHeight);
};

const getWidthFrom = function <T>(warehouse: Warehouse, direction: BarPositions<ColInfo>, getWidth: (cell: Element, tableSize: TableSize) => T, fallback: (deduced: Option<number>) => T, tableSize: TableSize) {
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

const getDeduced = function (deduced: Option<number>) {
  return deduced.map(function (d) { return d + 'px'; }).getOr('');
};

const getRawWidths = function (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) { // Warning, changed signature!
  return getWidthFrom(warehouse, direction, getRawW, getDeduced, tableSize);
};

const getPercentageWidths = function (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) {
  return getWidthFrom(warehouse, direction, Sizes.getPercentageWidth, function (deduced) {
    return deduced.fold(function () {
      return tableSize.minCellWidth();
    }, function (cellWidth) {
      return cellWidth / tableSize.pixelWidth() * 100;
    });
  }, tableSize);
};

const getPixelWidths = function (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) {
  return getWidthFrom(warehouse, direction, Sizes.getPixelWidth, function (deduced) {
    // Minimum cell width when all else fails.
    return deduced.getOrThunk(tableSize.minCellWidth);
  }, tableSize);
};

const getHeightFrom = function <T> (warehouse: Warehouse, direction: BarPositions<RowInfo>, getHeight: (cell: Element) => T, fallback: (deduced: Option<number>) => T) {
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

const getPixelHeights = function (warehouse: Warehouse, direction: BarPositions<RowInfo>) {
  return getHeightFrom(warehouse, direction, Sizes.getHeight, function (deduced: Option<number>) {
    return deduced.getOrThunk(CellUtils.minHeight);
  });
};

const getRawHeights = function (warehouse: Warehouse, direction: BarPositions<RowInfo>) {
  return getHeightFrom(warehouse, direction, getRawH, getDeduced);
};

export default {
  getRawWidths,
  getPixelWidths,
  getPercentageWidths,
  getPixelHeights,
  getRawHeights
};