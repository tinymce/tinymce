define(
  'ephox.snooker.model.RunOperation',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.snooker.api.ResizeDirection',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Transitions',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw',
    'ephox.snooker.resize.Bars',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Merger, Fun, Option, Options, ResizeDirection, TableLookup, DetailsList, Transitions, Warehouse, Redraw, Bars, Compare, Traverse) {
    var fromWarehouse = function (warehouse, generators) {
      return Transitions.toGrid(warehouse, generators);
    };

    var deriveRows = function (rendered, generators) {
      // The row is either going to be a new row, or the row of any of the cells.
      var findRow = function (details) {
        var rowOfCells = Options.findMap(details, function (detail) { return Traverse.parent(detail.element()); });
        return rowOfCells.getOrThunk(function () {
          return generators.row();
        });
      };

      return Arr.map(rendered, function (details) {
        var row = findRow(details);
        return {
          element: Fun.constant(row),
          cells: Fun.constant(details)
        };
      });
    };

    var toDetailList = function (grid, generators) {
      var rendered = Transitions.toDetails(grid, Compare.eq);
      return deriveRows(rendered, generators);
    };

    var findInWarehouse = function (warehouse, element) {
      var all = Arr.flatten(Arr.map(warehouse.all(), function (r) { return r.cells(); }));
      var raw = Arr.find(all, function (e) {
        return Compare.eq(element, e.element());
      });
      return Option.from(raw);
    };

    var run = function (operation, extract, adjustment, postAction, genWrappers) {
      return function (wire, table, target, generators, direction) {
        var input = DetailsList.fromTable(table);
        var warehouse = Warehouse.generate(input);
        var output = extract(warehouse, target).map(function (info) {
          var model = fromWarehouse(warehouse, generators);
          var result = operation(model, info, Compare.eq, genWrappers(generators));
          var grid = toDetailList(result.grid(), generators);
          return {
            grid: Fun.constant(grid),
            cursor: result.cursor
          };
        });

        return output.fold(function () {
          return Option.none();
        }, function (out) {
          Redraw.render(table, out.grid());
          adjustment(out.grid(), direction);
          postAction(table);
          Bars.rowRefresh(wire, table, ResizeDirection.height);
          Bars.colRefresh(wire, table, direction);
          return out.cursor();
        });
      };
    };

    var onCell = function (warehouse, target) {
      return TableLookup.cell(target.element()).bind(function (cell) {
        return findInWarehouse(warehouse, cell);
      });
    };

    var onPaste = function (warehouse, target) {
      return TableLookup.cell(target.element()).bind(function (cell) {
        return findInWarehouse(warehouse, cell).map(function (details) {
          return Merger.merge(details, {
            generators: target.generators,
            clipboard: target.clipboard
          });
        });
      });
    };

    var onMergable = function (warehouse, target) {
      return target.mergable();
    };

    var onUnmergable = function (warehouse, target) {
      return target.unmergable();
    };

    return {
      run: run,
      onCell: onCell,
      onPaste: onPaste,
      onMergable: onMergable,
      onUnmergable: onUnmergable
    };
  }
);