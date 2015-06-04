define(
  'ephox.snooker.api.TablePositions',

  [
    'ephox.snooker.selection.CellFinder',
    'ephox.snooker.selection.Rectangular'
  ],

  function (CellFinder, Rectangular) {
    var moveBy = function (cell, deltaRow, deltaColumn) {
      return CellFinder.moveBy(cell, deltaRow, deltaColumn);
    };

    var intercepts = function (table, first, last) {
      return CellFinder.intercepts(table, first, last);
    };

    var getBox = function (table, first, last) {
      return Rectangular.isRectangular(table, first, last);
    };

    return {
      moveBy: moveBy,
      intercepts: intercepts,
      getBox: getBox
    };
  }
);