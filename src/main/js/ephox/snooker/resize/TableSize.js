define(
  'ephox.snooker.resize.TableSize',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.snooker.resize.ColumnSizes',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.view.Width',
    'global!Math'
  ],

  function (Arr, Fun, ColumnSizes, Sizes, CellUtils, Width, Math) {
    var percentageBasedSizeRegex = new RegExp(/(\d+(\.\d+)?)%/);
    var pixelBasedSizeRegex = new RegExp(/(\d+(\.\d+)?)px|em/);

    var percentageSize = function (width, element) {
      var floatWidth = parseFloat(width, 10);
      var pixelWidth = Width.get(element);
      var getCellDelta = function (delta) {
        return delta / pixelWidth * 100;
      };
      var singleColumnWidth = function (width, _delta) {
        // If we have one column in a percent based table, that column should be 100% of the width of the table.
        return [100 - width];
      };
      // Get the width of a 10 pixel wide cell over the width of the table as a percentage
      var minCellWidth = function () {
        return CellUtils.minWidth() / pixelWidth * 100;
      };
      var setTableWidth = function (table, _newWidths, delta) {
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
        setCellWidth: Sizes.setPercentageWidth,
        setTableWidth: setTableWidth
      };
    };

    var pixelSize = function (width) {
      var intWidth = parseInt(width, 10);
      var getCellDelta = Fun.identity;
      var singleColumnWidth = function (width, _delta) {
        var newNext = Math.max(min, width + step);
        return [ newNext - width ];
      };
      var setTableWidth = function (table, newWidths, _delta) {
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
        setCellWidth: Sizes.setPixelWidth,
        setTableWidth: setTableWidth
      };
    };

    var chooseSize = function (element, width) {
      if (percentageBasedSizeRegex.test(width)) {
        var percentMatch = percentageBasedSizeRegex.exec(width);
        return percentageSize(percentMatch[1], element);
      } else if (pixelBasedSizeRegex.test(width)) {
        var pixelMatch = pixelBasedSizeRegex.exec(width);
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
        var fallbackWidth = Width.get(cell);
        return pixelSize(fallbackWidth);
      }, function (width) {
        return chooseSize(element, width);
      });
    };

    return {
      getTableSize: getTableSize
    };
});