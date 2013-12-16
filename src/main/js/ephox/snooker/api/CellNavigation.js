define(
  'ephox.snooker.api.CellNavigation',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.lookup.TableLookup',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Option, TableLookup, Compare) {
    var detect = function (current) {
      return TableLookup.table(current).bind(function (table) {
        var all = TableLookup.cells(table);
        var index = Arr.findIndex(all, function (x) {
          return Compare.eq(current, x);
        });

        return index < 0 ? Option.none() : Option.some({
          index: Fun.constant(index),
          all: Fun.constant(all)
        });
      });
    };

    var next = function (current) {
      var detection = detect(current);
      return detection.bind(function (info) {
        return info.index() + 1 < info.all().length ? Option.some(info.all()[info.index() + 1]) : Option.none();
      });
    };

    var prev = function (current) {
      var detection = detect(current);
      return detection.bind(function (info) {
        return info.index() - 1 >= 0 ? Option.some(info.all()[info.index() - 1]) : Option.none();
      });
    };

    return {
      next: next,
      prev: prev
    };
  }
);
