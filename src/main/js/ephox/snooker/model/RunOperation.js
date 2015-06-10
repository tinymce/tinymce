define(
  'ephox.snooker.model.RunOperation',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warefun',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw',
    'ephox.snooker.resize.Bars',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Options, TableLookup, DetailsList, Warefun, Warehouse, Redraw, Bars, Compare, Traverse) {
    var fromWarehouse = function (warehouse, generators) {
      var grid = [];
      for (var i = 0; i < warehouse.grid().rows(); i++) {
        var h = [];
        for (var j = 0; j < warehouse.grid().columns(); j++) {
          h.push(Warehouse.getAt(warehouse, i, j).map(function (item) {
            return item.element();
          }).getOrThunk(generators.gap));
        }
        grid.push(h);
      }
      return grid;
    };

    var toDetailList = function (grid, generators) {
      var rendered = Warefun.render(grid, Compare.eq);

      // The row is either going to be a new row, or the row of any of the cells.
      var findRow = function (cells) {
        var rowOfCells = Options.findMap(cells, function (c) { return Traverse.parent(c.element()); });
        return rowOfCells.getOrThunk(function () {
          return generators.row();
        });
      };

      return Arr.map(rendered, function (cells) {
        var row = findRow(cells);
        return {
          element: Fun.constant(row),
          cells: Fun.constant(cells)
        };
      });
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
          Bars.refresh(wire, table, direction);        
          return out.cursor();
        });
      };
    };

    var onCell = function (warehouse, target) {
      return TableLookup.cell(target.element()).bind(function (cell) {
        return findInWarehouse(warehouse, cell);
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
      onMergable: onMergable,
      onUnmergable: onUnmergable
    };
  }
);