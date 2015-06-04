define(
  'ephox.snooker.api.TablePositions',

  [
    'ephox.snooker.selection.CellFinder'
  ],

  function (CellFinder) {
    var moveBy = function (cell, deltaRow, deltaColumn) {
      return CellFinder.moveBy(cell, deltaRow, deltaColumn);
    };

    var intercepts = function (table, start, finish) {
      return CellFinder.intercepts(table, start, finish);
    };

    return {
      moveBy: moveBy,
      intercepts: intercepts
    };
  }
);