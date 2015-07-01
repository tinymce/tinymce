define(
  'ephox.snooker.resize.ColumnSizes',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Location'
  ],

  function (Arr, Fun, Blocks, Sizes, CellUtils, Util, Css, Location) {
    var getRaw = function (cell) {
      return Css.getRaw(cell, 'width').fold(function () {
        return Sizes.getWidth(cell) + 'px';
      }, function (raw) {
        return raw;
      });
    };

    var getPixelsW = function (cell) {
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
      return getWidthFrom(warehouse, direction, getPixelsW, function (deduced) {
        // Minimum cell width when all else fails.
        return deduced.getOrThunk(CellUtils.minWidth);
      });
    };

    var getPixelsH = function (cell) {
      return Sizes.getHeight(cell);
    };

    var getHeightFrom = function (warehouse, direction, getHeight, fallback) {
      var rows = Blocks.rows(warehouse);

      var backups = Arr.map(rows, function (cellOption) {
        cellOption.each(function (c) {
          console.log('cell: ', c.dom().cloneNode(true), Location.absolute(c).top());
        });
        return cellOption.map(direction.edge);
      });


  console.log('backed up positions', Arr.bind(backups, function (b) {
    return b.toArray();
  }));

      return Arr.map(rows, function (cellOption, c) {
        // Only use the width of cells that have no column span (or colspan 1)
        var rowCell = cellOption.filter(Fun.not(CellUtils.hasRowspan));
        return rowCell.fold(function () {
          // Can't just read the width of a cell, so calculate.
          var deduced = Util.deduce(backups, c);

          return fallback(deduced);
        }, function (cell) {
          console.log('cell.dom().cloneNode(true)',cell.dom().cloneNode(true), getHeight(cell));
          return getHeight(cell);
        });
      });
    };

    var getPixelHeights = function (warehouse, direction) {

      return getHeightFrom(warehouse, direction, getPixelsH, function (deduced) {
        // Minimum cell width when all else fails.
        return deduced.getOrThunk(CellUtils.minHeight);
      });
    };

    return {
      getRawWidths: getRawWidths,
      getPixelWidths: getPixelWidths,
      getPixelHeights: getPixelHeights
    };
  }
);