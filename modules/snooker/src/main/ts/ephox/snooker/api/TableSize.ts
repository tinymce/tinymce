import { HTMLElement, HTMLTableElement } from '@ephox/dom-globals';
import { Cell, Fun } from '@ephox/katamari';
import { Element, Width } from '@ephox/sugar';
import { Warehouse } from '../model/Warehouse';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import * as ColumnSizes from '../resize/ColumnSizes';
import * as Sizes from '../resize/Sizes';
import * as CellUtils from '../util/CellUtils';

export interface TableSize {
  readonly width: () => number;
  readonly pixelWidth: () => number;
  readonly getWidths: (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) => number[];
  readonly getCellDelta: (delta: number) => number;
  readonly singleColumnWidth: (w: number, delta: number) => number[];
  readonly minCellWidth: () => number;
  readonly setElementWidth: (element: Element<HTMLElement>, width: number) => void;
  readonly adjustTableWidth: (delta: number) => void;
  readonly label: string;
}

const noneSize = (table: Element<HTMLTableElement>): TableSize => {
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
    label: 'none'
  };
};

const percentageSize = (initialWidth: string, table: Element<HTMLTableElement>): TableSize => {
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
    label: 'percent'
  };
};

const pixelSize = (initialWidth: number, table: Element<HTMLTableElement>): TableSize => {
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
    label: 'pixel'
  };
};

const chooseSize = (element: Element<HTMLTableElement>, width: string) => {
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

const getTableSize = (table: Element<HTMLTableElement>) => {
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
