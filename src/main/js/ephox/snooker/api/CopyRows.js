define(
  'ephox.snooker.api.CopyRows',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.GridRow',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.model.Transitions',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw',
    'ephox.syrup.api.Compare',
    'ephox.syrup.api.Traverse'
  ],

  function (Arr, Option, Options, Structs, DetailsList, GridRow, RunOperation, Transitions, Warehouse, Redraw, Compare, Traverse) {
    var deriveRows = function (rendered, generators) {
      // The row is either going to be a new row, or the row of any of the cells.
      var findRow = function (details) {
        var rowOfCells = Options.findMap(details, function (detail) {
          return Traverse.parent(detail.element()).bind(function (row) {
            // If the row has a parent, it's within the existing table, otherwise it's a copied row
            return Traverse.parent(row).fold(function () {
                return Option.some(Structs.elementnew(row, true));
              },
              function (_section) {
                return Option.some(Structs.elementnew(row, false));
            });
          });
        });
        return rowOfCells.getOrThunk(function () {
          return Structs.elementnew(generators.row(), true);
        });
      };

      return Arr.map(rendered, function (details) {
        var row = findRow(details.details());
        return Structs.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
      });
    };

    var toDetailList = function (grid, generators) {
      var rendered = Transitions.toDetails(grid, Compare.eq);
      return deriveRows(rendered, generators);
    };

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
        var slicedDetails = toDetailList(elementNewGrid, generators);
        return Option.some(Redraw.copy(slicedDetails));
      });
    };
    return {
      copyRows:copyRows
    };
  }
);
