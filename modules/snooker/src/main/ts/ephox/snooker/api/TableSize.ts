import { Fun } from '@ephox/katamari';
import { Css, SugarBody, SugarElement, Width } from '@ephox/sugar';

import * as ColumnSizes from '../resize/ColumnSizes';
import * as Sizes from '../resize/Sizes';
import * as CellUtils from '../util/CellUtils';
import { Warehouse } from './Warehouse';

export interface TableSize {
  readonly width: () => number;
  readonly pixelWidth: () => number;
  readonly getWidths: (warehouse: Warehouse, tableSize: TableSize) => number[];
  readonly getCellDelta: (delta: number) => number;
  readonly singleColumnWidth: (w: number, delta: number) => number[];
  readonly minCellWidth: () => number;
  readonly setElementWidth: (element: SugarElement<HTMLElement>, width: number) => void;
  readonly adjustTableWidth: (delta: number) => void;
  readonly isRelative: boolean;
  readonly label: 'none' | 'pixel' | 'percent';
}

const widthLookup = (table: SugarElement<HTMLTableElement>, getter: (table: SugarElement<HTMLTableElement>) => number) => () => {
  // Use the actual width if attached, otherwise fallback to the raw width
  if (SugarBody.inBody(table)) {
    return getter(table);
  } else {
    return parseFloat(Css.getRaw(table, 'width').getOr('0'));
  }
};

const noneSize = (table: SugarElement<HTMLTableElement>): TableSize => {
  const getWidth = widthLookup(table, Width.get);
  const zero = Fun.constant(0);

  const getWidths = (warehouse: Warehouse, tableSize: TableSize) =>
    ColumnSizes.getPixelWidths(warehouse, table, tableSize);

  // Note: The 3 delta functions below return 0 to signify a change shouldn't be made
  // however this is currently not used, so may need changing if ever used
  return {
    width: getWidth,
    pixelWidth: getWidth,
    getWidths,
    getCellDelta: zero,
    singleColumnWidth: Fun.constant([ 0 ]),
    minCellWidth: zero,
    setElementWidth: Fun.noop,
    adjustTableWidth: Fun.noop,
    isRelative: true,
    label: 'none'
  };
};

const percentageSize = (table: SugarElement<HTMLTableElement>): TableSize => {
  const getFloatWidth = widthLookup(table, (elem) => parseFloat(Sizes.getPercentTableWidth(elem)));
  const getWidth = widthLookup(table, Width.get);
  const getCellDelta = (delta: number) => delta / getWidth() * 100;
  // If we have one column in a percent based table, that column should be 100% of the width of the table.
  const singleColumnWidth = (w: number, _delta: number) => [ 100 - w ];
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  const minCellWidth = () => CellUtils.minWidth() / getWidth() * 100;

  const adjustTableWidth = (delta: number) => {
    const currentWidth = getFloatWidth();
    const change = delta / 100 * currentWidth;
    const newWidth = currentWidth + change;
    Sizes.setPercentageWidth(table, newWidth);
  };

  const getWidths = (warehouse: Warehouse, tableSize: TableSize) =>
    ColumnSizes.getPercentageWidths(warehouse, table, tableSize);

  return {
    width: getFloatWidth,
    pixelWidth: getWidth,
    getWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth,
    setElementWidth: Sizes.setPercentageWidth,
    adjustTableWidth,
    isRelative: true,
    label: 'percent'
  };
};

const pixelSize = (table: SugarElement<HTMLTableElement>): TableSize => {
  const getWidth = widthLookup(table, Width.get);
  const getCellDelta = Fun.identity;

  const singleColumnWidth = (w: number, delta: number) => {
    const newNext = Math.max(CellUtils.minWidth(), w + delta);
    return [ newNext - w ];
  };

  const adjustTableWidth = (delta: number) => {
    const newWidth = getWidth() + delta;
    Sizes.setPixelWidth(table, newWidth);
  };

  const getWidths = (warehouse: Warehouse, tableSize: TableSize) =>
    ColumnSizes.getPixelWidths(warehouse, table, tableSize);

  return {
    width: getWidth,
    pixelWidth: getWidth,
    getWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth: CellUtils.minWidth,
    setElementWidth: Sizes.setPixelWidth,
    adjustTableWidth,
    isRelative: false,
    label: 'pixel'
  };
};

const chooseSize = (element: SugarElement<HTMLTableElement>, width: string) => {
  const percentMatch = Sizes.percentageBasedSizeRegex().exec(width);
  if (percentMatch !== null) {
    return percentageSize(element);
  } else {
    return pixelSize(element);
  }
};

const getTableSize = (table: SugarElement<HTMLTableElement>): TableSize => {
  const width = Sizes.getRawWidth(table);
  return width.fold(
    () => noneSize(table),
    (w) => chooseSize(table, w)
  );
};

export const TableSize = {
  getTableSize,
  pixelSize,
  percentageSize,
  noneSize
};
