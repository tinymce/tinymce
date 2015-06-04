define(
  'ephox.darwin.navigation.CellFinder',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Obj, Fun, Option, DetailsList, Warehouse, Compare, SelectorFind) {
    var findCell = function (cell) {
      return SelectorFind.ancestor(cell, 'table').bind(function (table) {
        var list = DetailsList.fromTable(table);

        var warehouse = Warehouse.generate(list);
        return Warehouse.findItem(warehouse, cell, Compare.eq).map(function (detail) {
          return {
            detail: Fun.constant(detail),
            warehouse: Fun.constant(warehouse)
          };
        });
      });
    };

    var moveBy = function (cell, row, column) {
      return findCell(cell).bind(function (info) {
        var detail = info.detail();
        var grid = info.warehouse();

        var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
        var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();

        var dest = Warehouse.getAt(grid, startRow + row, startCol + column);
        return dest.map(function (d) { return d.element(); });
      });
    };

    return {
      moveBy: moveBy
    };
  }
);