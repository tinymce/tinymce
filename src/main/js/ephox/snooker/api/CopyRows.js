define(
  'ephox.snooker.api.CopyRows',

  [
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.model.Transitions',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw'
  ],

  function (DetailsList, RunOperation, Transitions, Warehouse, Redraw) {
    var copyRows = function (table, target, generators) {
      var list = DetailsList.fromTable(table);
      var house = Warehouse.generate(list);
      var details = RunOperation.onCells(house, target);
      return details.map(function (selectedCells) {
        var grid = Transitions.toGrid(house, generators, false);
        var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
        var slicedDetails = RunOperation.toDetailList(slicedGrid, generators);
        return Redraw.copy(slicedDetails);
      });
    };
    return {
      copyRows:copyRows
    };
  }
);
