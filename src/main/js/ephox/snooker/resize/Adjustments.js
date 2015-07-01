define(
  'ephox.snooker.resize.Adjustments',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.calc.Deltas',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.ColumnSizes',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, Deltas, DetailsList, Warehouse, ColumnSizes, Sizes, CellUtils, SelectorFind) {
    var recalculateWidth = function (warehouse, widths) {
      var all = Warehouse.justCells(warehouse);

      var total = function (start, end) {
        var r = 0;
        for (var i = start; i < end; i++) {
          r += widths[i] !== undefined ? parseInt(widths[i], 10) : 0;
        }
        return r;
      };

      return Arr.map(all, function (cell) {
        var width = total(cell.column(), cell.column() + cell.colspan());
        return {
          element: cell.element,
          width: Fun.constant(width),
          colspan: cell.colspan
        };
      });
    };

    var recalculateHeight = function (warehouse, heights) {
      var all = Warehouse.justCells(warehouse);

      var total = function (start, end) {
        var r = 0;
        for (var i = start; i < end; i++) {
          r += heights[i] !== undefined ? parseInt(heights[i], 10) : 0;
        }
        return r;
      };

      return Arr.map(all, function (cell) {
        var height = total(cell.row(), cell.row() + cell.rowspan());
        return {
          element: cell.element,
          height: Fun.constant(height),
          rowspan: cell.colspan
        };
      });
    };

    var recalculateTableHeight = function (warehouse, heights) {

    };

    var recalculateRowHeight = function (warehouse, heights) {

      return Arr.map(warehouse.all(), function (row, i) {
        return {
          element: row.element,
          height: Fun.constant(heights[i])
        };
      });
    };

    var getWarehouse = function (list) {
      return Warehouse.generate(list);
    };

    var adjust = function (table, delta, index, direction) {
      var list = DetailsList.fromTable(table);
      var warehouse = getWarehouse(list);
      var widths = ColumnSizes.getPixelWidths(warehouse, direction);

      // Calculate all of the new widths for columns
      var deltas = Deltas.determine(widths, index, delta, CellUtils.minWidth());
      var newWidths = Arr.map(deltas, function (dx, i) {
        return dx + widths[i];
      });

      // Set the width of each cell based on the column widths
      var newSizes = recalculateWidth(warehouse, newWidths);
      Arr.each(newSizes, function (cell) {
        Sizes.setWidth(cell.element(), cell.width());
      });

      // Set the overall width of the table.
      var total = Arr.foldr(newWidths, function (b, a) { return b + a; }, 0);
      Sizes.setWidth(table, total);
    };

    var adjustHeight = function (table, delta, index, direction) {
      var list = DetailsList.fromTable(table);
      var warehouse = getWarehouse(list);
      var heights = ColumnSizes.getPixelHeights(warehouse, direction);

      // Calculate all of the new widths for columns
      var deltas = Deltas.determine(heights, index, delta, CellUtils.minWidth());
      var newHeights = Arr.map(deltas, function (dx, i) {
        return dx + heights[i];
      });

      // Set the width of each cell based on the column widths
      var newCellSizes = recalculateHeight(warehouse, newHeights);
      var newRowSizes = recalculateRowHeight(warehouse, newHeights);

      Arr.each(newRowSizes, function (row) {
        Sizes.setHeight(row.element(), row.height());
      });

      Arr.each(newCellSizes, function (cell) {
        Sizes.setHeight(cell.element(), cell.height());
      });

      // Set the overall width of the table.
      var total = Arr.foldr(newHeights, function (b, a) { return b + a; }, 0);
      Sizes.setHeight(table, total);
    };
    // Ensure that the width of table cells match the passed in table information.
    var adjustTo = function (list, direction) {
      var warehouse = getWarehouse(list);
      var widths = ColumnSizes.getPixelWidths(warehouse, direction);

      // Set the width of each cell based on the column widths
      var newSizes = recalculateWidth(warehouse, widths);
      Arr.each(newSizes, function (cell) {
        Sizes.setWidth(cell.element(), cell.width());
      });

      var total = Arr.foldr(widths, function (b, a) { return a + b; }, 0);
      if (newSizes.length > 0) {
        SelectorFind.ancestor(newSizes[0].element(), 'table').each(function (table) {
          Sizes.setWidth(table, total);
        });
      }
    };

    return {
      adjust: adjust,
      adjustHeight: adjustHeight,
      adjustTo: adjustTo
    };
  }
);
