define(
  'ephox.snooker.util.CellUtils',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr'
  ],

  function (Fun, Attr) {
    var hasColspan = function (cell) {
      return Attr.has(cell, 'colspan') && parseInt(Attr.get(cell, 'colspan'), 10) > 1;
    };

    var hasRowspan = function (cell) {
      return Attr.has(cell, 'rowspan') && parseInt(Attr.get(cell, 'rowspan'), 10) > 1;
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