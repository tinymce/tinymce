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
      var spanned = Arr.bind(context, function (span) {
        return span.fold(function () {
          return [];
        }, function (whole) {
          return [];
        }, function (p, offset) {
          return isSpanning(p, offset) ? [ p ] : [];
        });
      });

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
      var isSpanning = function (p, offset) {
        return offset > 0;
      };

      var stoppedSpanning = function (p, offset) {
        return offset === 0;
      };

      return general(warehouse, rowIndex, isSpanning, stoppedSpanning);
    };

    var after = function (warehouse, rowIndex) {
      var isSpanning = function (p, offset) {
        return offset < p.rowspan() - 1;
      };

      var stoppedSpanning = function (p, offset) {
        return offset === p.rowspan() - 1;
      };

      return general(warehouse, rowIndex, isSpanning, stoppedSpanning);
    };

    return {
      before: before,
      after: after
    };
  }
);
