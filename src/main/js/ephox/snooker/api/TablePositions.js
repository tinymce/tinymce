define(
  'ephox.snooker.api.TablePositions',

  [
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.CellFinder',
    'ephox.snooker.selection.CellGroup',
    'ephox.sugar.api.dom.Compare'
  ],

  function (TableLookup, DetailsList, Warehouse, CellFinder, CellGroup, Compare) {
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

    var nestedIntercepts = function (table, first, firstTable, last, lastTable) {
      var warehouse = getWarehouse(table);
      var startCell = Compare.eq(table, firstTable) ? first : CellFinder.parentCell(warehouse, first);
      var lastCell = Compare.eq(table, lastTable) ? last : CellFinder.parentCell(warehouse, last);
      return CellFinder.intercepts(warehouse, startCell, lastCell);
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
      nestedIntercepts: nestedIntercepts,
      getBox: getBox
    };
  }
);