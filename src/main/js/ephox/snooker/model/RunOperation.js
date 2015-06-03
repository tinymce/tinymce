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
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Options, TableLookup, DetailsList, Warefun, Warehouse, Redraw, Bars, Compare, Element, Node, Traverse) {
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
        console.log('e', e.element().dom(), 'elem', element.dom());
        return Compare.eq(element, e.element());
      });

      return Option.from(raw);
    };

    var run = function (operation, extract, adjustment, postAction, genWrappers) {
      return function (wire, table, target, generators, direction) { 
        var input = DetailsList.fromTable(table);  
        var warehouse = Warehouse.generate(input);
        var output = extract(warehouse, target).map(function (info) {
          console.log('extracting worked');
          var model = fromWarehouse(warehouse);
          var result = operation(model, info, Compare.eq, genWrappers(generators));
          return toDetailList(result);
        });

        output.each(function (out) {
          Redraw.render(table, out);
          adjustment(out);
          postAction(table);
          Bars.refresh(wire, table, direction);
        });
      };
    };

    var onCell = function (warehouse, target) {
      console.log('target', target);
      return TableLookup.cell(target.element()).bind(function (cell) {
        console.log('cell: ', cell);
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