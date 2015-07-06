define(
  'ephox.snooker.util.CellUtils',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'global!parseInt'
  ],

  function (Fun, Attr, Css, parseInt) {
    var getSpan = function (cell, type) {
      return Attr.has(cell, type) && parseInt(Attr.get(cell, type), 10) > 1;
    };

    var hasColspan = function (cell) {
      return getSpan(cell, 'cellspan');
    };

    var hasRowspan = function (cell) {
      return getSpan(cell, 'rowspan');
    };

    var getInt = function (element, property) {
      return parseInt(Css.get(element, property), 10);
    };

    return {
      hasColspan: hasColspan,
      hasRowspan: hasRowspan,
      minWidth: Fun.constant(10),
      minHeight: Fun.constant(10),
      getInt: getInt
    };
  }
);