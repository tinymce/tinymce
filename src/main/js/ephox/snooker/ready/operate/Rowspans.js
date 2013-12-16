define(
  'ephox.snooker.ready.operate.Rowspans',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.ready.data.CellType',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.util.Util'
  ],

  function (Arr, Fun, CellType, Warehouse, Util) {
    var get = function (warehouse, rowIndex) {
      var range = Util.range(0, warehouse.grid().columns());
      return Arr.map(range, function (colIndex) {
        var item = Warehouse.getAt(warehouse, rowIndex, colIndex);
        return item === undefined ? CellType.none() :
          item.rowspan() > 1 ? CellType.partial(item, rowIndex - item.row()) : CellType.whole(item);
      });
    };

    var general = function (warehouse, rowIndex) { };

    var before = function (warehouse, rowIndex) {

    };

    var after = function (warehouse, rowIndex) {
      var context = get(warehouse, rowIndex);
      var spanned = Arr.bind(context, function (span) {
        return span.fold(function () {
          return [];
        }, function (whole) {
          return [];
        }, function (p, offset) {
          return start.row() < p.row() + p.rowspan() - 1 ? [ p ] : [];
        });
      });

      var unspanned = Arr.bind(context, function (span) {
        return span.fold(Fun.constant([]), function (w) {
          return [ w ];
        }, function (p, offset) {
          return offset == p.rowspan() - 1 ? [ p ] : [];
        });
      });

      return {
        spanned: Fun.constant(spanned),
        unspanned: Fun.constant(unspanned)
      };
    };

    return {
      before: before,
      after: after
    };
  }
);
