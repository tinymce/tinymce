import { Cell, Fun } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';
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
  readonly label: string;
}

const noneSize = (table: SugarElement<HTMLTableElement>): TableSize => {
  const getWidth = () => Width.get(table);
  const zero = Fun.constant(0);

  // Note: The 3 delta functions below return 0 to signify a change shouldn't be made
  // however this is currently not used, so may need changing if ever used
  return {
    width: getWidth,
    pixelWidth: getWidth,
    getWidths: ColumnSizes.getPixelWidths,
    getCellDelta: zero,
    singleColumnWidth: Fun.constant([ 0 ]),
    minCellWidth: zero,
    setElementWidth: Fun.noop,
    adjustTableWidth: Fun.noop,
    isRelative: true,
    label: 'none'
  };
};

const percentageSize = (initialWidth: string, table: SugarElement<HTMLTableElement>): TableSize => {
  const floatWidth = Cell(parseFloat(initialWidth));
  const pixelWidth = Cell(Width.get(table));
  const getCellDelta = (delta: number) => delta / pixelWidth.get() * 100;
  // If we have one column in a percent based table, that column should be 100% of the width of the table.
  const singleColumnWidth = (w: number, _delta: number) => [ 100 - w ];
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  const minCellWidth = () => CellUtils.minWidth() / pixelWidth.get() * 100;
  const adjustTableWidth = (delta: number) => {
    const currentWidth = floatWidth.get();
    const change = delta / 100 * currentWidth;
    const newWidth = currentWidth + change;
    Sizes.setPercentageWidth(table, newWidth);
    floatWidth.set(newWidth);
    pixelWidth.set(Width.get(table));
  };

  return {
    width: floatWidth.get,
    pixelWidth: pixelWidth.get,
    getWidths: ColumnSizes.getPercentageWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth,
    setElementWidth: Sizes.setPercentageWidth,
    adjustTableWidth,
    isRelative: true,
    label: 'percent'
  };
};

const pixelSize = (initialWidth: number, table: SugarElement<HTMLTableElement>): TableSize => {
  const width = Cell(initialWidth);
  const getWidth = width.get;
  const getCellDelta = Fun.identity;
  const singleColumnWidth = (w: number, delta: number) => {
    const newNext = Math.max(CellUtils.minWidth(), w + delta);
    return [ newNext - w ];
  };
  const adjustTableWidth = (delta: number) => {
    const newWidth = getWidth() + delta;
    Sizes.setPixelWidth(table, newWidth);
    width.set(newWidth);
  };

  return {
    width: getWidth,
    pixelWidth: getWidth,
    getWidths: ColumnSizes.getPixelWidths,
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
    return percentageSize(percentMatch[1], element);
  }
  const pixelMatch = Sizes.pixelBasedSizeRegex().exec(width);
  if (pixelMatch !== null) {
    const intWidth = parseInt(pixelMatch[1], 10);
    return pixelSize(intWidth, element);
  }
  const fallbackWidth = Width.get(element);
  return pixelSize(fallbackWidth, element);
};

const getTableSize = (table: SugarElement<HTMLTableElement>) => {
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
