import { HTMLTableCellElement, HTMLTableElement } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
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
  readonly setElementWidth: (cell: Element<HTMLTableCellElement>, amount: number) => void;
  readonly setTableWidth: (table: Element<HTMLTableElement>, newWidths: number[], delta: number) => void;
  readonly label: string;
}

const noneSize = (element: Element<HTMLTableElement>): TableSize => {
  const getWidth = () => Width.get(element);
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
    setTableWidth: Fun.noop,
    label: 'none'
  };
};

const percentageSize = (width: string, element: Element<HTMLTableElement>): TableSize => {
  const floatWidth = parseFloat(width);
  const pixelWidth = Width.get(element);
  const getCellDelta = (delta: number) => delta / pixelWidth * 100;
  // If we have one column in a percent based table, that column should be 100% of the width of the table.
  const singleColumnWidth = (w: number, _delta: number) => [ 100 - w ];
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  const minCellWidth = () => CellUtils.minWidth() / pixelWidth * 100;
  const setTableWidth = (table: Element, _newWidths: number[], delta: number) => {
    const ratio = delta / 100;
    const change = ratio * floatWidth;
    Sizes.setPercentageWidth(table, floatWidth + change);
  };
  return {
    width: Fun.constant(floatWidth),
    pixelWidth: Fun.constant(pixelWidth),
    getWidths: ColumnSizes.getPercentageWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth,
    setElementWidth: Sizes.setPercentageWidth,
    setTableWidth,
    label: 'percent'
  };
};

const pixelSize = (width: number): TableSize => {
  const getCellDelta = Fun.identity;
  const singleColumnWidth = (w: number, delta: number) => {
    const newNext = Math.max(CellUtils.minWidth(), w + delta);
    return [ newNext - w ];
  };
  const setTableWidth = (table: Element, newWidths: number[], _delta: number) => {
    const total = Arr.foldr(newWidths, (b, a) => b + a, 0);
    Sizes.setPixelWidth(table, total);
  };
  return {
    width: Fun.constant(width),
    pixelWidth: Fun.constant(width),
    getWidths: ColumnSizes.getPixelWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth: CellUtils.minWidth,
    setElementWidth: Sizes.setPixelWidth,
    setTableWidth,
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
    return pixelSize(intWidth);
  }
  const fallbackWidth = Width.get(element);
  return pixelSize(fallbackWidth);
};

const getTableSize = (element: Element<HTMLTableElement>) => {
  const width = Sizes.getRawWidth(element);
  return width.fold(
    () => noneSize(element),
    (w) => chooseSize(element, w)
  );
};

export const TableSize = {
  getTableSize,
  pixelSize,
  percentageSize,
  noneSize
};
