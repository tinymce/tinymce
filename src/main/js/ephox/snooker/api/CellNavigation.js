define(
  'ephox.snooker.api.CellNavigation',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.CellLocation',
    'ephox.snooker.lookup.TableLookup',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Option, CellLocation, TableLookup, Compare) {
    /*
     * Identify the index of the current cell within all the cells, and 
     * a list of the cells within its table.
     */
    var detect = function (current) {
      console.log('current: ', current.dom());
      return TableLookup.table(current).bind(function (table) {
        console.log('table: ', table.dom());
        var all = TableLookup.cells(table);
        var index = Arr.findIndex(all, function (x) {
          return Compare.eq(current, x);
        });

        console.log('index: ', index);

        return index < 0 ? Option.none() : Option.some({
          index: Fun.constant(index),
          all: Fun.constant(all)
        });
      });
    };

    /* 
     * Identify the CellLocation of the cell when navigating forward from current
     */
    var next = function (current) {
      var detection = detect(current);
      return detection.fold(function () {
        return CellLocation.none(current);
      }, function (info) {
        return info.index() + 1 < info.all().length ? CellLocation.middle(current, info.all()[info.index() + 1]) : CellLocation.last(current);
      });
    };

    /* 
     * Identify the CellLocation of the cell when navigating back from current
     */
    var prev = function (current) {
      var detection = detect(current);
      return detection.fold(function () {
        return CellLocation.none();
      }, function (info) {
        return info.index() - 1 >= 0 ? CellLocation.middle(current, info.all()[info.index() - 1]) : CellLocation.none(current);
      });
    };

    return {
      next: next,
      prev: prev
    };
  }
);
