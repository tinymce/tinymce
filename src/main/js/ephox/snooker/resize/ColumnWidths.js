define(
  'ephox.snooker.resize.ColumnWidths',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.Css'
  ],

  function (Arr, Fun, Blocks, Sizes, CellUtils, Util, Css) {
    var getRaw = function (cell) {
      return Css.getRaw(cell, 'width').fold(function () {
        return Sizes.getWidth(cell) + 'px';
      }, function (raw) {
        return raw;
      });
    };

    var getPixels = function (cell) {
      return Sizes.getWidth(cell);
    };

    var getWidthFrom = function (warehouse, direction, getWidth, suffix) {
      var columns = Blocks.columns(warehouse);

      var backups = Arr.map(columns, function (cellOption) {
        return cellOption.map(direction.edge);
      });

      return Arr.map(columns, function (cellOption, c) {
        // Only use the width of cells that have no column span (or colspan 1)
        return cellOption.filter(Fun.not(CellUtils.hasColspan)).map(getWidth).getOrThunk(function () {
          // Default column size when all else fails.
          return Util.deduce(backups, c).getOrThunk(CellUtils.minWidth) + suffix;
        });
      });
    };

    var getRawWidths = function (warehouse, direction) {
      return getWidthFrom(warehouse, direction, getRaw, 'px');
    };

    var getPixelWidths = function (warehouse, direction) {
      return getWidthFrom(warehouse, direction, getPixels, '');
    };

    return {
      getRawWidths: getRawWidths,
      getPixelWidths: getPixelWidths
    };
  }
);