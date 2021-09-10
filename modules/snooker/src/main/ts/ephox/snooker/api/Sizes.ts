import { Arr, Fun, Optional } from '@ephox/katamari';
import { Css, Height, SugarElement, Width } from '@ephox/sugar';

import * as BarPositions from '../resize/BarPositions';
import * as ColumnSizes from '../resize/ColumnSizes';
import * as Redistribution from '../resize/Redistribution';
import * as Sizes from '../resize/Sizes';
import * as CellUtils from '../util/CellUtils';
import { DetailExt, RowDetail, Column, Detail } from './Structs';
import { Warehouse } from './Warehouse';

const redistributeToW = (newWidths: string[], cells: DetailExt[], unit: string): void => {
  Arr.each(cells, (cell) => {
    const widths = newWidths.slice(cell.column, cell.colspan + cell.column);
    const w = Redistribution.sum(widths, CellUtils.minWidth());
    Css.set(cell.element, 'width', w + unit);
  });
};

const redistributeToColumns = (newWidths: string[], columns: Column[], unit: string): void => {
  Arr.each(columns, (column, index: number) => {
    const width = Redistribution.sum([ newWidths[index] ], CellUtils.minWidth());
    Css.set(column.element, 'width', width + unit);
  });
};

const redistributeToH = <T extends Detail> (newHeights: string[], rows: RowDetail<T>[], cells: DetailExt[], unit: string): void => {
  Arr.each(cells, (cell) => {
    const heights = newHeights.slice(cell.row, cell.rowspan + cell.row);
    const h = Redistribution.sum(heights, CellUtils.minHeight());
    Css.set(cell.element, 'height', h + unit);
  });

  Arr.each(rows, (row, i) => {
    Css.set(row.element, 'height', newHeights[i]);
  });
};

const getUnit = (newSize: string): 'px' | '%' => {
  return Redistribution.validate(newSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
};

// Procedure to resize table dimensions to optWidth x optHeight and redistribute cell and row dimensions.
// Updates CSS of the table, rows, and cells.
const redistribute = (table: SugarElement<HTMLTableElement>, optWidth: Optional<string>, optHeight: Optional<string>): void => {
  const warehouse = Warehouse.fromTable(table);
  const rows = warehouse.all;
  const cells = Warehouse.justCells(warehouse);
  const columns = Warehouse.justColumns(warehouse);

  optWidth.each((newWidth) => {
    const widthUnit = getUnit(newWidth);
    const totalWidth = Width.get(table);
    const oldWidths = ColumnSizes.getRawWidths(warehouse, table);
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
    const oldHeights = ColumnSizes.getRawHeights(warehouse, table, BarPositions.height);
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
