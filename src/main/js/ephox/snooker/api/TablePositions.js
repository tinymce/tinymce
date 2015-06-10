define(
  'ephox.snooker.api.TablePositions',

  [
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.CellFinder',
    'ephox.snooker.selection.CellGroup'
  ],

  function (TableLookup, DetailsList, Warehouse, CellFinder, CellGroup) {
    var moveBy = function (cell, deltaRow, deltaColumn) {
      return TableLookup.table(cell).bind(function (table) {
        var warehouse = getWarehouse(table);
        return CellFinder.moveBy(warehouse, cell, deltaRow, deltaColumn);
      });
    };

    var intercepts = function (table, first, last) {
      var warehouse = getWarehouse(table);
      return CellFinder.intercepts(warehouse, first, last);
    };

    var getBox = function (table, first, last) {
      var warehouse = getWarehouse(table);
      return CellGroup.getBox(warehouse, first, last);
    };

    // Private method ... keep warehouse in snooker, please.
    var getWarehouse = function (table) {
      var list = DetailsList.fromTable(table);
      return Warehouse.generate(list);
    };

    return {
      moveBy: moveBy,
      intercepts: intercepts,
      getBox: getBox
    };
  }
);