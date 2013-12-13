define(
  'ephox.snooker.ready.resize.Adjustments',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.ready.calc.Deltas',
    'ephox.snooker.ready.lookup.Blocks',
    'ephox.snooker.ready.model.DetailsList',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.sugar.api.Css'
  ],

  function (Arr, Fun, Deltas, Blocks, DetailsList, Warehouse, Css) {
    var minWidth = 10;

    var recalculate = function (warehouse, widths) {
      var all = Arr.flatten(warehouse.all());
      
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
          width: Fun.constant(width)
        };
      });
    };

    var adjust = function (table, delta, index, direction) {
      var list = DetailsList.fromTable(table);

      // Calculate the current widths of the columns
      var warehouse = Warehouse.generate(list);
      var columns = Blocks.columns(warehouse);
      var widths = Arr.map(columns, function (cell) {
        return parseInt(Css.get(cell, 'width'), 10);
      });
      
      // Calculate all of the new widths for columns
      var deltas = Deltas.determine(widths, index, delta, minWidth);
      var newWidths = Arr.map(deltas, function (dx, i) {
        return dx + widths[i];
      });

      // Set the width of each cell based on the column widths
      var newSizes = recalculate(warehouse, newWidths);
      Arr.each(newSizes, function (cell) {
        Css.set(cell.element(), 'width', cell.width() + 'px');
      });

      // Set the overall width of the table.
      var total = Arr.foldr(newWidths, function (b, a) { return b + a; }, 0);
      Css.set(table, 'width', total + 'px');
    };

    return {
      adjust: adjust,
      recalculate: recalculate
    };
  }
);
