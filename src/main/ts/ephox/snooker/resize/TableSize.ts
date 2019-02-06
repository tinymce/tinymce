import { Arr, Fun } from '@ephox/katamari';
import { Width } from '@ephox/sugar';
import CellUtils from '../util/CellUtils';
import ColumnSizes from './ColumnSizes';
import Sizes from './Sizes';

const percentageSize = function (width, element) {
  const floatWidth = parseFloat(width);
  const pixelWidth = Width.get(element);
  const getCellDelta = function (delta) {
    return delta / pixelWidth * 100;
  };
  const singleColumnWidth = function (w, _delta?) {
    // If we have one column in a percent based table, that column should be 100% of the width of the table.
    return [100 - w];
  };
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  const minCellWidth = function () {
    return CellUtils.minWidth() / pixelWidth * 100;
  };
  const setTableWidth = function (table, _newWidths, delta?) {
    const total = floatWidth + delta;
    Sizes.setPercentageWidth(table, total);
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

const pixelSize = function (width) {
  const intWidth = parseInt(width, 10);
  const getCellDelta = Fun.identity;
  const singleColumnWidth = function (w, delta) {
    const newNext = Math.max(CellUtils.minWidth(), w + delta);
    return [ newNext - w ];
  };
  const setTableWidth = function (table, newWidths, _delta?) {
    const total = Arr.foldr(newWidths, function (b, a) { return b + a; }, 0);
    Sizes.setPixelWidth(table, total);
  };
  return {
    width: Fun.constant(intWidth),
    pixelWidth: Fun.constant(intWidth),
    getWidths: ColumnSizes.getPixelWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth: CellUtils.minWidth,
    setElementWidth: Sizes.setPixelWidth,
    setTableWidth
  };
};

const chooseSize = function (element, width) {
  if (Sizes.percentageBasedSizeRegex().test(width)) {
    const percentMatch = Sizes.percentageBasedSizeRegex().exec(width);
    return percentageSize(percentMatch[1], element);
  } else if (Sizes.pixelBasedSizeRegex().test(width)) {
    const pixelMatch = Sizes.pixelBasedSizeRegex().exec(width);
    return pixelSize(pixelMatch[1]);
  } else {
    const fallbackWidth = Width.get(element);
    return pixelSize(fallbackWidth);
  }
};

const getTableSize = function (element) {
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