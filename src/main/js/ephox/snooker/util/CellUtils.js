define(
  'ephox.snooker.util.CellUtils',

  [
    'ephox.sugar.api.Attr'
  ],

  function (Attr) {
    var hasColspan = function (cell) {
      return Attr.has(cell, 'colspan') && parseInt(Attr.get(cell, 'colspan'), 10) > 1;
    };

    return {
      hasColspan: hasColspan
    };
  }
);