define(
  'ephox.snooker.api.CopyRows',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.GridRow',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.model.Transitions',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw'
  ],

  function (Arr, Option, Structs, DetailsList, GridRow, RunOperation, Transitions, Warehouse, Redraw) {
    var copyRows = function (table, target, generators) {
      var list = DetailsList.fromTable(table);
      var house = Warehouse.generate(list);
      var details = RunOperation.onCells(house, target);
      return details.bind(function (selectedCells) {
        var grid = Transitions.toGrid(house, generators);
        var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
        var elementNewGrid = Arr.map(slicedGrid, function (row) {
          return GridRow.mapCells(row, function (cell) {
            return Structs.elementnew(cell, false);
          });
        });
        var slicedDetails = RunOperation.toDetailList(elementNewGrid, generators);
        return Option.some(Redraw.copy(slicedDetails));
      });
    };
    return {
      copyRows:copyRows
    };
  }
);
