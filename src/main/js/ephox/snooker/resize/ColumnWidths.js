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
      return Css.getRaw(cell, 'width').getOr('');
    };

    var getPixels = function (cell) {
      return Sizes.getWidth(cell);
    };

    var getWidthFrom = function (warehouse, direction, getWidth, fallback) {
      var columns = Blocks.columns(warehouse);

      var backups = Arr.map(columns, function (cellOption) {
        return cellOption.map(direction.edge);
      });

      return Arr.map(columns, function (cellOption, c) {
        // Only use the width of cells that have no column span (or colspan 1)
        var columnCell = cellOption.filter(Fun.not(CellUtils.hasColspan));
        return columnCell.fold(function () {
          // Can't just read the width of a cell, so calculate.
          var deduced = Util.deduce(backups, c);
          return fallback(deduced);
        }, function (cell) {
          return getWidth(cell);
        });
      });
    };

    var getRawWidths = function (warehouse, direction) {
      return getWidthFrom(warehouse, direction, getRaw, function (deduced) {
        return deduced.map(function (d) { return d + 'px'; }).getOr('');
      });
    };

    var getPixelWidths = function (warehouse, direction) {
      return getWidthFrom(warehouse, direction, getPixels, function (deduced) {
        // Minimum cell width when all else fails.
        return deduced.getOrThunk(CellUtils.minWidth);
      });
    };

    return {
      getRawWidths: getRawWidths,
      getPixelWidths: getPixelWidths
    };
  }
);