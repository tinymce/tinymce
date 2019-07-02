import { Arr, Fun } from '@ephox/katamari';
import { Width, Element } from '@ephox/sugar';
import CellUtils from '../util/CellUtils';
import ColumnSizes from './ColumnSizes';
import Sizes from './Sizes';
import { TableSize } from './Types';

const percentageSize = function (width: string, element: Element): TableSize {
  const floatWidth = parseFloat(width);
  const pixelWidth = Width.get(element);
  const getCellDelta = function (delta: number) {
    return delta / pixelWidth * 100;
  };
  const singleColumnWidth = function (w: number, _delta: number) {
    // If we have one column in a percent based table, that column should be 100% of the width of the table.
    return [100 - w];
  };
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  const minCellWidth = function () {
    return CellUtils.minWidth() / pixelWidth * 100;
  };
  const setTableWidth = function (table: Element, _newWidths: number[], delta: number) {
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
    setTableWidth
  };
};

const pixelSize = function (width: number): TableSize {
  const getCellDelta = Fun.identity;
  const singleColumnWidth = function (w: number, delta: number) {
    const newNext = Math.max(CellUtils.minWidth(), w + delta);
    return [ newNext - w ];
  };
  const setTableWidth = function (table: Element, newWidths: number[], _delta: number) {
    const total = Arr.foldr(newWidths, function (b, a) { return b + a; }, 0);
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
    setTableWidth
  };
};

const chooseSize = function (element: Element, width: string) {
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

const getTableSize = function (element: Element) {
  const width = Sizes.getRawWidth(element);
  // If we have no width still, return a pixel width at least.
  return width.fold(function () {
    const fallbackWidth = Width.get(element);
    return pixelSize(fallbackWidth);
  }, function (w) {
    return chooseSize(element, w);
  });
};

export default {
  getTableSize
};