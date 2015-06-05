define(
  'ephox.snooker.selection.CellFinder',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.Rectangular',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, DetailsList, Warehouse, Rectangular, Compare, SelectorFind) {
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

    var inSelection = function (bounds, detail) {
      return (
        (detail.column() >= bounds.startCol() && detail.column()  <= bounds.finishCol()) ||
        (detail.column() + detail.colspan() - 1 >= bounds.startCol() && detail.column() + detail.colspan() - 1 <= bounds.finishCol())
      ) && (
        (detail.row() >= bounds.startRow() && detail.row() <= bounds.finishRow()) ||
        (detail.row() + detail.rowspan() - 1 >= bounds.startRow() && detail.row() + detail.rowspan() - 1 <= bounds.finishRow())
      );
    };

    var intercepts = function (table, start, finish) {
      return Rectangular.getBox(table, start, finish).map(function (info) {
        var inside = Warehouse.filterItems(info.warehouse(), Fun.curry(inSelection, info));
        return Arr.map(inside, function (detail) {
          return detail.element();
        });
      });
    };

    return {
      moveBy: moveBy,
      intercepts: intercepts
    };
  }
);