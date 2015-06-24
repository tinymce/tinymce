define(
  'ephox.snooker.util.CellUtils',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.Attr'
  ],

  function (Arr, Fun, Util, Attr) {
    var hasColspan = function (cell) {
      return Attr.has(cell, 'colspan') && parseInt(Attr.get(cell, 'colspan'), 10) > 1;
    };

    var minWidth = function () {
      return 10;
    };

    var cellSpan = function (xs, comparator) {
      var known = [];
      var duplicates = [];
      Arr.each(Arr.flatten(xs), function (cell, r) {
        if (Arr.exists(known, Fun.curry(comparator, cell))) duplicates.push(cell);
        known.push(cell);
      });
      // return Util.unique(duplicates, comparator);
      return duplicates;
    };

    return {
      hasColspan: hasColspan,
      minWidth: minWidth,
      cellSpan: cellSpan
    };
  }
);