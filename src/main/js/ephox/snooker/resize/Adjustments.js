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
    var total = function (start, end, measures) {
        var r = 0;
        for (var i = start; i < end; i++) {
          r += measures[i] !== undefined ? parseInt(measures[i], 10) : 0;
        }
        return r;
    };

    var recalculateWidth = function (warehouse, widths) {
      var all = Warehouse.justCells(warehouse);

      return Arr.map(all, function (cell) {
        var width = total(cell.column(), cell.column() + cell.colspan(), widths);
        return {
          element: cell.element,
          width: Fun.constant(width),
          colspan: cell.colspan
        };
      });
    };

    var recalculateHeight = function (warehouse, heights) {
      var all = Warehouse.justCells(warehouse);
      return Arr.map(all, function (cell) {
        var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
        return {
          element: cell.element,
          height: Fun.constant(height),
          rowspan: cell.colspan
        };
      });
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

    var getNewTableSize = function (newSize) {
      return Arr.foldr(newSize, function (b, a) { return b + a; }, 0);
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
      var total = getNewTableSize(newWidths);
      Sizes.setWidth(table, total);
    };

    var adjustHeight = function (table, delta, index, direction) {
      var list = DetailsList.fromTable(table);
      var warehouse = getWarehouse(list);
      var heights = ColumnSizes.getPixelHeights(warehouse, direction);

      var newHeights = Arr.map(heights, function (dy, i) {
        return index === i ? delta + dy : dy;
      });

      var newCellSizes = recalculateHeight(warehouse, newHeights);
      var newRowSizes = recalculateRowHeight(warehouse, newHeights);

      Arr.each(newRowSizes, function (row) {
        Sizes.setHeight(row.element(), row.height());
      });

      Arr.each(newCellSizes, function (cell) {
        Sizes.setHeight(cell.element(), cell.height());
      });

      var total = getNewTableSize(newHeights);
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
      recalculateWidth: recalculateWidth, // These two methods are exposed because atomically
      recalculateHeight: recalculateHeight, // tested, but these are not actually used directly
      adjustTo: adjustTo
    };
  }
);
