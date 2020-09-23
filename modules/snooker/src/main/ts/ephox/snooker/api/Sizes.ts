import { Arr, Fun, Optional } from '@ephox/katamari';
import { Css, Height, SugarElement, Width } from '@ephox/sugar';
import * as BarPositions from '../resize/BarPositions';
import * as ColumnSizes from '../resize/ColumnSizes';
import * as Redistribution from '../resize/Redistribution';
import * as Sizes from '../resize/Sizes';
import * as CellUtils from '../util/CellUtils';
import { DetailExt, RowData, Column } from './Structs';
import { TableSize } from './TableSize';
import { Warehouse } from './Warehouse';

type BarPositions<A> = BarPositions.BarPositions<A>;

const redistributeToW = function (newWidths: string[], cells: DetailExt[], unit: string) {
  Arr.each(cells, function (cell) {
    const widths = newWidths.slice(cell.column, cell.colspan + cell.column);
    const w = Redistribution.sum(widths, CellUtils.minWidth());
    Css.set(cell.element, 'width', w + unit);
  });
};

const redistributeToColumns = (newWidths: string[], columns: Column[], unit: string) => {
  Arr.each(columns, (column, index: number) => {
    const width = Redistribution.sum([ newWidths[index] ], CellUtils.minWidth());
    Css.set(column.element, 'width', width + unit);
  });
};

const redistributeToH = function <T> (newHeights: string[], rows: RowData<T>[], cells: DetailExt[], unit: string) {
  Arr.each(cells, function (cell) {
    const heights = newHeights.slice(cell.row, cell.rowspan + cell.row);
    const h = Redistribution.sum(heights, CellUtils.minHeight());
    Css.set(cell.element, 'height', h + unit);
  });

  Arr.each(rows, function (row, i) {
    Css.set(row.element, 'height', newHeights[i]);
  });
};

const getUnit = function (newSize: string) {
  return Redistribution.validate(newSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
};

// Procedure to resize table dimensions to optWidth x optHeight and redistribute cell and row dimensions.
// Updates CSS of the table, rows, and cells.
const redistribute = (table: SugarElement, optWidth: Optional<string>, optHeight: Optional<string>, tableSize: TableSize) => {
  const warehouse = Warehouse.fromTable(table);
  const rows = warehouse.all;
  const cells = Warehouse.justCells(warehouse);
  const columns = Warehouse.justColumns(warehouse);

  optWidth.each((newWidth) => {
    const widthUnit = getUnit(newWidth);
    const totalWidth = Width.get(table);
    const oldWidths = ColumnSizes.getRawWidths(warehouse, tableSize);
    const nuWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);

    if (Warehouse.hasColumns(warehouse)) {
      redistributeToColumns(nuWidths, columns, widthUnit);
    } else {
      redistributeToW(nuWidths, cells, widthUnit);
    }

    Css.set(table, 'width', newWidth);
  });

  optHeight.each((newHeight) => {
    const hUnit = getUnit(newHeight);
    const totalHeight = Height.get(table);
    const oldHeights = ColumnSizes.getRawHeights(warehouse, BarPositions.height);
    const nuHeights = Redistribution.redistribute(oldHeights, totalHeight, newHeight);
    redistributeToH(nuHeights, rows, cells, hUnit);
    Css.set(table, 'height', newHeight);
  });
};

const isPercentSizing = Sizes.isPercentSizing;
const isPixelSizing = Sizes.isPixelSizing;
const isNoneSizing = Sizes.isNoneSizing;

const getPercentTableWidth = Sizes.getPercentTableWidth;
const getPercentTableHeight = Sizes.getPercentTableHeight;

export {
  getPercentTableWidth,
  getPercentTableHeight,
  isPercentSizing,
  isPixelSizing,
  isNoneSizing,
  redistribute
};
