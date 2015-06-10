define(
  'ephox.snooker.resize.Adjustments',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.calc.Deltas',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, Option, Deltas, Blocks, DetailsList, Warehouse, Sizes, CellUtils, Util, SelectorFind) {
    var minWidth = 10;

    var recalculate = function (warehouse, widths) {
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

    var getWidths = function (warehouse, direction) {
      var columns = Blocks.columns(warehouse);

      var backups = Arr.map(columns, function (cellOption) {
        return cellOption.map(direction.edge);
      });

      return Arr.map(columns, function (cellOption, c) {
        // Only use the width of cells that have no column span (or colspan 1)
        return cellOption.filter(Fun.not(CellUtils.hasColspan)).map(Sizes.getWidth).getOrThunk(function () {
          // Default column size when all else fails.
          return Util.deduce(backups, c).getOrThunk(CellUtils.minWidth);
        });
      });
    };

    var getWarehouse = function (list) {
      return Warehouse.generate(list);
    };

    var adjust = function (table, delta, index, direction) {
      var list = DetailsList.fromTable(table);
      var warehouse = getWarehouse(list);
      var widths = getWidths(warehouse, direction);

      // Calculate all of the new widths for columns
      var deltas = Deltas.determine(widths, index, delta, minWidth);

      var newWidths = Arr.map(deltas, function (dx, i) {
        return dx + widths[i];
      });

      // Set the width of each cell based on the column widths
      var newSizes = recalculate(warehouse, newWidths);
      Arr.each(newSizes, function (cell) {
        Sizes.setWidth(cell.element(), cell.width());
      });

      // Set the overall width of the table.
      var total = Arr.foldr(newWidths, function (b, a) { return b + a; }, 0);
      Sizes.setWidth(table, total);
    };

    // Ensure that the width of table cells match the passed in table information.
    var adjustTo = function (list, direction) {
      var warehouse = getWarehouse(list);
      var widths = getWidths(warehouse, direction);

      // Set the width of each cell based on the column widths
      var newSizes = recalculate(warehouse, widths);
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
      recalculate: recalculate,
      adjustTo: adjustTo
    };
  }
);
