define(
  'ephox.snooker.selection.CellFinder',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.CellBounds',
    'ephox.snooker.selection.CellGroup',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Warehouse, CellBounds, CellGroup, Compare) {
    var moveBy = function (warehouse, cell, row, column) {
      return Warehouse.findItem(warehouse, cell, Compare.eq).bind(function (info) {
        var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
        var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
        var dest = Warehouse.getAt(warehouse, startRow + row, startCol + column);
        return dest.map(function (d) { return d.element(); });
      });
    };
    
    var intercepts = function (warehouse, start, finish) {
      return CellGroup.getAnyBox(warehouse, start, finish).map(function (bounds) {
        var inside = Warehouse.filterItems(warehouse, Fun.curry(CellBounds.inSelection, bounds));
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