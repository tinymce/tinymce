define(
  'ephox.snooker.util.CellUtils',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr'
  ],

  function (Fun, Attr) {
    var getSpan = function (cell, type) {
      return Attr.has(cell, type) && parseInt(Attr.get(cell, type), 10) > 1;
    };

    var hasColspan = function (cell) {
      return getSpan(cell, 'cellspan');
    };

    var hasRowspan = function (cell) {
      return getSpan(cell, 'rowspan');
    };

    var minWidth = function () {
      return 10;
    };

    return {
      hasColspan: hasColspan,
      hasRowspan: hasRowspan,
      minWidth: minWidth,
      minHeight: Fun.constant(30)
    };
  }
);