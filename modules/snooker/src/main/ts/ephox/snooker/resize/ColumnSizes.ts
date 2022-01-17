import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement, SugarNode, Width } from '@ephox/sugar';

import { TableSize } from '../api/TableSize';
import { Warehouse } from '../api/Warehouse';
import * as Blocks from '../lookup/Blocks';
import * as CellUtils from '../util/CellUtils';
import { CellElement } from '../util/TableTypes';
import * as Util from '../util/Util';
import { BarPositions, RowInfo, width } from './BarPositions';
import * as Sizes from './Sizes';

const isCol = SugarNode.isTag('col');

const getRawW = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>): string => {
  return Sizes.getRawWidth(cell).getOrThunk(() => Sizes.getPixelWidth(cell) + 'px');
};

const getRawH = (cell: SugarElement<HTMLTableCellElement>): string => {
  return Sizes.getRawHeight(cell).getOrThunk(() => Sizes.getHeight(cell) + 'px');
};

const justCols = (warehouse: Warehouse): Optional<SugarElement<HTMLTableColElement>>[] =>
  Arr.map(Warehouse.justColumns(warehouse), (column) => Optional.from(column.element));

// Col elements don't have valid computed widths/positions in all browsers, so treat them as invalid in that case
const isValidColumn = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>): boolean => {
  const browser = PlatformDetection.detect().browser;
  const supportsColWidths = browser.isChromium() || browser.isFirefox();
  return isCol(cell) ? supportsColWidths : true;
};

const getDimension = <T extends HTMLElement, U>(
  cellOpt: Optional<SugarElement<T>>,
  index: number,
  backups: Optional<number>[],
  filter: (cell: SugarElement<T>) => boolean,
  getter: (cell: SugarElement<T>) => U,
  fallback: (deduced: Optional<number>) => U
): U =>
  cellOpt.filter(filter).fold(
    // Can't just read the width of a cell, so calculate.
    () => fallback(Util.deduce(backups, index)),
    (cell) => getter(cell)
  );

const getWidthFrom = <T>(
  warehouse: Warehouse,
  table: SugarElement<HTMLTableElement>,
  getWidth: (cell: SugarElement<CellElement>) => T,
  fallback: (deduced: Optional<number>) => T
): T[] => {
  // Only treat a cell as being valid for a column representation if it has a raw width, otherwise we won't be able to calculate the expected width.
  // This is needed as one cell may have a width but others may not, so we need to try and use one with a specified width first.
  const columnCells = Blocks.columns(warehouse);
  const columns: Optional<SugarElement<HTMLTableCellElement | HTMLTableColElement>>[] = Warehouse.hasColumns(warehouse) ? justCols(warehouse) : columnCells;

  const backups = [ Optional.some(width.edge(table)) ].concat(Arr.map(width.positions(columnCells, table), (pos) =>
    pos.map((p) => p.x)
  ));

  // Only use the width of cells that have no column span (or colspan 1)
  const colFilter = Fun.not(CellUtils.hasColspan);

  return Arr.map(columns, (cellOption, c) => {
    return getDimension(cellOption, c, backups, colFilter, (column) => {
      if (isValidColumn(column)) {
        return getWidth(column);
      } else {
        // Invalid column so fallback to trying to get the computed width from the cell
        const cell = Optionals.bindFrom(columnCells[c], Fun.identity);
        return getDimension(cell, c, backups, colFilter, (cell) => fallback(Optional.some(Width.get(cell))), fallback);
      }
    }, fallback);
  });
};

const getDeduced = (deduced: Optional<number>): string => {
  return deduced.map((d) => {
    return d + 'px';
  }).getOr('');
};

const getRawWidths = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>): string[] => {
  return getWidthFrom(warehouse, table, getRawW, getDeduced);
};

const getPercentageWidths = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize): number[] => {
  return getWidthFrom(warehouse, table, Sizes.getPercentageWidth, (deduced) => {
    return deduced.fold(() => {
      return tableSize.minCellWidth();
    }, (cellWidth) => {
      return cellWidth / tableSize.pixelWidth() * 100;
    });
  });
};

const getPixelWidths = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize): number[] => {
  return getWidthFrom(warehouse, table, Sizes.getPixelWidth, (deduced) => {
    // Minimum cell width when all else fails.
    return deduced.getOrThunk(tableSize.minCellWidth);
  });
};

const getHeightFrom = <T> (
  warehouse: Warehouse,
  table: SugarElement<HTMLTableElement>,
  direction: BarPositions<RowInfo>,
  getHeight: (cell: SugarElement<HTMLTableCellElement>) => T,
  fallback: (deduced: Optional<number>) => T
): T[] => {
  const rows = Blocks.rows(warehouse);

  const backups = [ Optional.some(direction.edge(table)) ].concat(Arr.map(direction.positions(rows, table), (pos) =>
    pos.map((p) => p.y)
  ));

  return Arr.map(rows, (cellOption, c) => {
    return getDimension(cellOption, c, backups, Fun.not(CellUtils.hasRowspan), getHeight, fallback);
  });
};

const getPixelHeights = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, direction: BarPositions<RowInfo>): number[] => {
  return getHeightFrom(warehouse, table, direction, Sizes.getHeight, (deduced: Optional<number>) => {
    return deduced.getOrThunk(CellUtils.minHeight);
  });
};

const getRawHeights = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, direction: BarPositions<RowInfo>): string[] => {
  return getHeightFrom(warehouse, table, direction, getRawH, getDeduced);
};

export { getRawWidths, getPixelWidths, getPercentageWidths, getPixelHeights, getRawHeights };

