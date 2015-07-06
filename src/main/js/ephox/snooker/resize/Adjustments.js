define(
  'ephox.snooker.resize.Adjustments',

  [
    'ephox.compass.Arr',
    'ephox.snooker.calc.Deltas',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.ColumnSizes',
    'ephox.snooker.resize.Recalculations',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.SelectorFind',
    'global!Math'
  ],

  function (Arr, Deltas, DetailsList, Warehouse, ColumnSizes, Recalculations, Sizes, CellUtils, SelectorFind, Math) {
    var getWarehouse = function (list) {
      return Warehouse.generate(list);
    };

    var sumUp = function (newSize) {
      return Arr.foldr(newSize, function (b, a) { return b + a; }, 0);
    };

    var getTableWarehouse = function (table) {
      var list = DetailsList.fromTable(table);
      return getWarehouse(list);
    };

    var adjustWidth = function (table, delta, index, direction) {
      var warehouse = getTableWarehouse(table);
      var widths = ColumnSizes.getPixelWidths(warehouse, direction);

      // Calculate all of the new widths for columns
      var deltas = Deltas.determine(widths, index, delta, CellUtils.minWidth());
      var newWidths = Arr.map(deltas, function (dx, i) {
        return dx + widths[i];
      });

      // Set the width of each cell based on the column widths
      var newSizes = Recalculations.recalculateWidth(warehouse, newWidths);
      Arr.each(newSizes, function (cell) {
        Sizes.setWidth(cell.element(), cell.width());
      });

      // Set the overall width of the table.
      var total = sumUp(newWidths);
      Sizes.setWidth(table, total);
    };

    var adjustHeight = function (table, delta, index, direction) {
      var warehouse = getTableWarehouse(table);
      var heights = ColumnSizes.getPixelHeights(warehouse, direction);

      var newHeights = Arr.map(heights, function (dy, i) {
        return index === i ? Math.max(delta + dy, CellUtils.minHeight()) : dy;
      });

      var newCellSizes = Recalculations.recalculateHeight(warehouse, newHeights);
      var newRowSizes = Recalculations.matchRowHeight(warehouse, newHeights);

      Arr.each(newRowSizes, function (row) {
        Sizes.setHeight(row.element(), row.height());
      });

      Arr.each(newCellSizes, function (cell) {
        Sizes.setHeight(cell.element(), cell.height());
      });

      var total = sumUp(newHeights);
      Sizes.setHeight(table, total);
    };

    // Ensure that the width of table cells match the passed in table information.
    var adjustWidthTo = function (list, direction) {
      var warehouse = getWarehouse(list);
      var widths = ColumnSizes.getPixelWidths(warehouse, direction);

      // Set the width of each cell based on the column widths
      var newSizes = Recalculations.recalculateWidth(warehouse, widths);
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
      adjustWidth: adjustWidth,
      adjustHeight: adjustHeight,
      adjustWidthTo: adjustWidthTo
    };
  }
);
