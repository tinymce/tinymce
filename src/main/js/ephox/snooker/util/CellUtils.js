define(
  'ephox.snooker.util.CellUtils',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.Attr'
  ],

  function (Arr, Fun, Structs, Util, Attr) {
    var hasColspan = function (cell) {
      return Attr.has(cell, 'colspan') && parseInt(Attr.get(cell, 'colspan'), 10) > 1;
    };

    var minWidth = function () {
      return 10;
    };

    // var spanMap = function (xs, comparator) {
    //   // Assumes xs is a 2 dimensional array
    //   var spans = [];
    //   var item = Structs.span;
    //   var known = [];

    //   return Arr.map(xs, function (row) {
    //     return Arr.map(row, function (cell) {
    //       var isKnown = Arr.exists(known, Fun.curry(comparator, cell));
    //       known.push(cell);
    //       return isKnown;
    //     });
    //   });
    // };

    // var spanMap = function (xs, comparator) {
    //   // Assumes xs is a 2 dimensional array
    //   var known = [];
    //   var item = Structs.span;
    //   var address = Structs.address;

    //   return Arr.each(xs, function (row, r) {
    //     return Arr.each(row, function (cell, c) {

    //       known.push(cell);
    //       var isKnown = Arr.contains(known, cell);
    //       return isKnown;
    //     });
    //   });
    // };

    var contentSpan = function (xs, comparator) {
      var known = [];
      var duplicates = [];
      Arr.each(Arr.flatten(xs), function (cell, r) {
        var isKnown = Arr.exists(known, Fun.curry(comparator, cell));
        known.push(cell);
        if (isKnown) duplicates.push(cell);
      });
      return Util.unique(duplicates, comparator);
    };

    return {
      hasColspan: hasColspan,
      minWidth: minWidth,
      contentSpan: contentSpan
    };
  }
);