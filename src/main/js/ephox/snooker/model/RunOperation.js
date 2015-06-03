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
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Options, TableLookup, DetailsList, Warefun, Warehouse, Redraw, Bars, Compare, Element, Traverse) {
    var fromWarehouse = function (warehouse) {
      var grid = [];
      for (var i = 0; i < warehouse.grid().rows(); i++) {
        var h = [];
        for (var j = 0; j < warehouse.grid().columns(); j++) {
          h.push(Warehouse.getAt(warehouse, i, j).getOrDie('hacky').element());
        }
        grid.push(h);
      }
      return grid;
    };

    var toDetailList = function (grid) {
      var fun = Warefun.render(grid, Compare.eq);

      // Add rows.
      var newFun = Arr.map(fun, function (f) {
        var rowOfCells = Options.findMap(f.cells(), function (c) { return Traverse.parent(c.element()); });
        var tr = rowOfCells.getOrThunk(function () {
          return Element.fromTag('tr');
        });
        return {
          element: Fun.constant(tr),
          cells: f.cells
        };
      });

      return newFun;
    };

    var findInWarehouse = function (warehouse, element) {
      var all = Arr.flatten(Arr.map(warehouse.all(), function (r) { return r.cells(); }));
      var raw = Arr.find(all, function (e) {
        return Compare.eq(element, e.element());
      });

      return Option.from(raw);
    };

    var run = function (operation, adjustment, postAction, genWrappers) {
      return function (wire, element, generators, direction) { 
        TableLookup.cell(element).each(function (cell) {
          TableLookup.table(element).each(function (table) {
            var input = DetailsList.fromTable(table);  
            var warehouse = Warehouse.generate(input);
            
            var output = findInWarehouse(warehouse, cell).map(function (detail) {
              var model = fromWarehouse(warehouse);
              var result = operation(model, detail, Compare.eq, genWrappers(generators));
              return toDetailList(result);
            }).getOr(input);

            Redraw.render(table, output);
            adjustment(output);
            postAction(table);
            Bars.refresh(wire, table, direction);
          });
        });
      };
    };

    return {
      run: run
    };
  }
);