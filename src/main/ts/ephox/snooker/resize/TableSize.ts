import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import ColumnSizes from './ColumnSizes';
import Sizes from './Sizes';
import CellUtils from '../util/CellUtils';
import { Width } from '@ephox/sugar';

var percentageSize = function (width, element) {
  var floatWidth = parseFloat(width);
  var pixelWidth = Width.get(element);
  var getCellDelta = function (delta) {
    return delta / pixelWidth * 100;
  };
  var singleColumnWidth = function (width, _delta?) {
    // If we have one column in a percent based table, that column should be 100% of the width of the table.
    return [100 - width];
  };
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  var minCellWidth = function () {
    return CellUtils.minWidth() / pixelWidth * 100;
  };
  var setTableWidth = function (table, _newWidths, delta?) {
    var total = floatWidth + delta;
    Sizes.setPercentageWidth(table, total);
  };
  return {
    width: Fun.constant(floatWidth),
    pixelWidth: Fun.constant(pixelWidth),
    getWidths: ColumnSizes.getPercentageWidths,
    getCellDelta: getCellDelta,
    singleColumnWidth: singleColumnWidth,
    minCellWidth: minCellWidth,
    setElementWidth: Sizes.setPercentageWidth,
    setTableWidth: setTableWidth
  };
};

var pixelSize = function (width) {
  var intWidth = parseInt(width, 10);
  var getCellDelta = Fun.identity;
  var singleColumnWidth = function (width, delta) {
    var newNext = Math.max(CellUtils.minWidth(), width + delta);
    return [ newNext - width ];
  };
  var setTableWidth = function (table, newWidths, _delta?) {
    var total = Arr.foldr(newWidths, function (b, a) { return b + a; }, 0);
    Sizes.setPixelWidth(table, total);
  };
  return {
    width: Fun.constant(intWidth),
    pixelWidth: Fun.constant(intWidth),
    getWidths: ColumnSizes.getPixelWidths,
    getCellDelta: getCellDelta,
    singleColumnWidth: singleColumnWidth,
    minCellWidth: CellUtils.minWidth,
    setElementWidth: Sizes.setPixelWidth,
    setTableWidth: setTableWidth
  };
};

var chooseSize = function (element, width) {
  if (Sizes.percentageBasedSizeRegex().test(width)) {
    var percentMatch = Sizes.percentageBasedSizeRegex().exec(width);
    return percentageSize(percentMatch[1], element);
  } else if (Sizes.pixelBasedSizeRegex().test(width)) {
    var pixelMatch = Sizes.pixelBasedSizeRegex().exec(width);
    return pixelSize(pixelMatch[1]);
  } else {
    var fallbackWidth = Width.get(element);
    return pixelSize(fallbackWidth);
  }
};

var getTableSize = function (element) {
  var width = Sizes.getRawWidth(element);
  // If we have no width still, return a pixel width at least.
  return width.fold(function () {
    var fallbackWidth = Width.get(element);
    return pixelSize(fallbackWidth);
  }, function (width) {
    return chooseSize(element, width);
  });
};

export default {
  getTableSize: getTableSize
};