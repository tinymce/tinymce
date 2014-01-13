define(
  'ephox.snooker.operate.Rowspans',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.data.CellType',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Fun, CellType, Warehouse, Util) {
    // Returns a list of length grid.columns that has a CellType for each column position on this row.
    var get = function (warehouse, rowIndex) {
      var range = Util.range(0, warehouse.grid().columns());
      return Arr.map(range, function (colIndex) {
        var item = Warehouse.getAt(warehouse, rowIndex, colIndex);
        return item.fold(function () {
          return CellType.none();
        }, function (val) {
          return val.rowspan() > 1 ? CellType.partial(val, rowIndex - val.row()) : CellType.whole(val);
        });
      });
    };

    var general = function (warehouse, rowIndex, isSpanning, stoppedSpanning) {
      var context = get(warehouse, rowIndex);
      // Identify the list of cells which have a span that will affect a row operation at rowIndex
      var spanned = Arr.bind(context, function (span) {
        return span.fold(function () {
          return [];
        }, function (whole) {
          return [];
        }, function (p, offset) {
          return isSpanning(p, offset) ? [ p ] : [];
        });
      });

      // Identify the list of cells which have a span that will not affect a row operation at rowIndex
      var unspanned = Arr.bind(context, function (span) {
        return span.fold(Fun.constant([]), function (w) {
          return [ w ];
        }, function (p, offset) {
          return stoppedSpanning(p, offset) ? [ p ] : [];
        });
      });

      return {
        spanned: Fun.constant(spanned),
        unspanned: Fun.constant(unspanned)
      };
    };

    var before = function (warehouse, rowIndex) {
      // Cells which have an offset higher than the start are just going to increase span when inserting before
      var isSpanning = function (p, offset) {
        return offset > 0;
      };

      // Cells which have an offset at the start are not going to be affected when inserting before
      var stoppedSpanning = function (p, offset) {
        return offset === 0;
      };

      return general(warehouse, rowIndex, isSpanning, stoppedSpanning);
    };

    var after = function (warehouse, rowIndex) {
      // Cells which have an offset before the end are just going to increase span when inserting after
      var isSpanning = function (p, offset) {
        return offset < p.rowspan() - 1;
      };

      // Cells which have an offset at the end are not going to be affected when inserting after
      var stoppedSpanning = function (p, offset) {
        return offset === p.rowspan() - 1;
      };

      return general(warehouse, rowIndex, isSpanning, stoppedSpanning);
    };

    var either = function (warehouse, rowIndex) {
      var isSpanning = Fun.constant(true);
      var stoppedSpanning = Fun.constant(false);
      return general(warehouse, rowIndex, isSpanning, stoppedSpanning);
    };

    return {
      before: before,
      after: after,
      either: either
    };
  }
);
