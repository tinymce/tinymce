define(
  'ephox.snooker.api.CopyRows',

  [
    'ephox.perhaps.Option',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.model.Transitions',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw'
  ],

  function (Option, DetailsList, RunOperation, Transitions, Warehouse, Redraw) {
    var copyRows = function (table, target, generators) {
      var list = DetailsList.fromTable(table);
      var house = Warehouse.generate(list);
      var details = RunOperation.onCells(house, target);
      return details.bind(function (selectedCells) {
        var grid = Transitions.toGrid(house, generators, false);
        var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
        var slicedDetails = RunOperation.toDetailList(slicedGrid, generators);
        return Option.some(Redraw.copy(slicedDetails));
      });
    };
    return {
      copyRows:copyRows
    };
  }
);
