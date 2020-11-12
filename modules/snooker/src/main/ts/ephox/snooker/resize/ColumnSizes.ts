import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Css, SugarElement, SugarNode, Width } from '@ephox/sugar';
import { TableSize } from '../api/TableSize';
import { Warehouse } from '../api/Warehouse';
import * as Blocks from '../lookup/Blocks';
import * as CellUtils from '../util/CellUtils';
import * as Util from '../util/Util';
import { BarPositions, RowInfo, width } from './BarPositions';
import * as Sizes from './Sizes';

const isCol = SugarNode.isTag('col');

const getRaw = function (cell: SugarElement, property: string, getter: (e: SugarElement) => number) {
  return Css.getRaw(cell, property).fold(function () {
    return getter(cell) + 'px';
  }, function (raw) {
    return raw;
  });
};

const getRawW = function (cell: SugarElement, tableSize: TableSize) {
  // For col elements use the computed width as col elements aren't affected by borders, padding, etc...
  const fallback = (e: SugarElement) => isCol(e) ? Width.get(e) : Sizes.getPixelWidth(e, tableSize);
  return getRaw(cell, 'width', fallback);
};

const getRawH = function (cell: SugarElement) {
  return getRaw(cell, 'height', Sizes.getHeight);
};

const justCols = (warehouse: Warehouse): Optional<SugarElement<HTMLTableColElement>>[] =>
  Arr.map(Warehouse.justColumns(warehouse), (column) => Optional.from(column.element));

// Col elements don't have valid computed widths/positions, so treat them as invalid if they don't have a raw width
const isValidColumn = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>) =>
  !isCol(cell) || Css.getRaw(cell, 'width').isSome();

const getDimension = <T>(cellOpt: Optional<SugarElement>, index: number, backups: Optional<number>[], filter: (cell: SugarElement) => boolean, getter: (cell: SugarElement) => T, fallback: (deduced: Optional<number>) => T): T =>
  cellOpt.filter(filter).fold(
    // Can't just read the width of a cell, so calculate.
    () => fallback(Util.deduce(backups, index)),
    (cell) => getter(cell)
  );

const getWidthFrom = function <T> (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, getWidth: (cell: SugarElement, tableSize: TableSize) => T,
                                   fallback: (deduced: Optional<number>) => T, tableSize: TableSize) {
  const columnCells = Blocks.columns(warehouse);
  const columns: Optional<SugarElement>[] = Warehouse.hasColumns(warehouse) ? justCols(warehouse) : columnCells;

  const backups = [ Optional.some(width.edge(table)) ].concat(Arr.map(width.positions(columnCells, table), (pos) =>
    pos.map((p) => p.x)
  ));

  // Only use the width of cells that have no column span (or colspan 1)
  const colFilter = Fun.not(CellUtils.hasColspan);

  return Arr.map(columns, function (cellOption, c) {
    return getDimension(cellOption, c, backups, colFilter, (column) => {
      if (isValidColumn(column)) {
        return getWidth(column, tableSize);
      } else {
        // Invalid column so fallback to trying to get the computed width from the cell
        const cell = Optionals.bindFrom(columnCells[c], Fun.identity);
        return getDimension(cell, c, backups, colFilter, (cell) => fallback(Optional.some(Width.get(cell))), fallback);
      }
    }, fallback);
  });
};

const getDeduced = function (deduced: Optional<number>) {
  return deduced.map(function (d) { return d + 'px'; }).getOr('');
};

const getRawWidths = function (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize) {
  return getWidthFrom(warehouse, table, getRawW, getDeduced, tableSize);
};

const getPercentageWidths = function (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize) {
  return getWidthFrom(warehouse, table, Sizes.getPercentageWidth, function (deduced) {
    return deduced.fold(function () {
      return tableSize.minCellWidth();
    }, function (cellWidth) {
      return cellWidth / tableSize.pixelWidth() * 100;
    });
  }, tableSize);
};

const getPixelWidths = function (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize) {
  return getWidthFrom(warehouse, table, Sizes.getPixelWidth, function (deduced) {
    // Minimum cell width when all else fails.
    return deduced.getOrThunk(tableSize.minCellWidth);
  }, tableSize);
};

const getHeightFrom = function <T> (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, direction: BarPositions<RowInfo>, getHeight: (cell: SugarElement) => T, fallback: (deduced: Optional<number>) => T) {
  const rows = Blocks.rows(warehouse);

  const backups = [ Optional.some(direction.edge(table)) ].concat(Arr.map(direction.positions(rows, table), (pos) =>
    pos.map((p) => p.y)
  ));

  return Arr.map(rows, function (cellOption, c) {
    return getDimension(cellOption, c, backups, Fun.not(CellUtils.hasRowspan), getHeight, fallback);
  });
};

const getPixelHeights = function (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, direction: BarPositions<RowInfo>) {
  return getHeightFrom(warehouse, table, direction, Sizes.getHeight, function (deduced: Optional<number>) {
    return deduced.getOrThunk(CellUtils.minHeight);
  });
};

const getRawHeights = function (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, direction: BarPositions<RowInfo>) {
  return getHeightFrom(warehouse, table, direction, getRawH, getDeduced);
};

export { getRawWidths, getPixelWidths, getPercentageWidths, getPixelHeights, getRawHeights };

