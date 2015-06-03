define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.ModelOperations',
    'ephox.snooker.model.Warefun',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.ColumnModification',
    'ephox.snooker.operate.RowModification',
    'ephox.snooker.operate.TableOperation',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Options, TableLookup, ModelOperations, Warefun, Warehouse, ColumnModification, RowModification, TableOperation, Adjustments, Compare, Element, Remove, SelectorFind, Traverse) {
    /*
     * Using the current element, execute operation on the table.
     */
    var modify = function (operation, adjustment, post) {
      return function (wire, element, generators, direction) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {
            TableOperation.run(wire, table, cell, function (warehouse, dompos) {
              return operation(warehouse, dompos.row(), dompos.column(), generators, Compare.eq);
            }, adjustment, direction);

            post(table);
          });
        });
      };
    };

    var getElementGrid = function (warehouse, sColspan, sRowspan, fColspan, fRowspan, leadCol, leadRow) {

      var grid = [];
      for (var r = 0; r < warehouse.rows(); r++) {
        grid[r] = [];
        for (var c = 0; c < warehouse.columns(); c++) {
          var normal = Warehouse.getAt(warehouse, r, c).map(function (e) { return e.element(); }).getOr(undefined);
          grid[r][c] = r>=sRowspan&&r<=fRowspan&&c>=sColspan&&c<=fColspan ? Warehouse.getAt(warehouse, leadRow, leadRow).map(function (e) { return e.element(); }).getOr(undefined) : normal;
        }
      }
      return grid;
    };

    var multi = function (_operation, _adjustment, _post) {
      return function (wire, element, generators, direction) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {

            var sColspan = 0;
            var sRowspan = 1;
            var fColspan = 2;
            var fRowspan = 2;

            var leadCol = 1;
            var leadRow = 2;

            TableOperation.run(wire, table, cell, function (warehouse, dompos) {
              var grid = getElementGrid(warehouse.grid(), sColspan, sRowspan, fColspan, fRowspan, leadCol, leadRow);
              var fun = Warefun.render(grid, Compare.eq);

              // now we have to correlate the rows
              var lists = warehouse.all();
              var hackedFun = Arr.map(fun, function (f, fi) {
                return {
                  element: lists[fi].element,
                  cells: f.cells
                };
              });


              return hackedFun;
            }, _adjustment,
            direction);
          });
        });
      };
    };

    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    /* HACKING */

    var hackety = function (warehouse) {
      console.log('warehouse', warehouse);
      var hackhack = [];
      for (var i = 0; i < warehouse.grid().rows(); i++) {
        var h = [];
        for (var j = 0; j < warehouse.grid().columns(); j++) {
          h.push(Warehouse.getAt(warehouse, i, j).getOrDie('hacky').element());
        }
        hackhack.push(h);
      }
      return hackhack;
    };

    var posthackety = function (hack) {
      var fun = Warefun.render(hack, Compare.eq);

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

    var insertBefore = function () {

    };

    var findMe = function (warehouse, element) {
      var all = Arr.flatten(Arr.map(warehouse.all(), function (r) { return r.cells(); }));
      var raw = Arr.find(all, function (e) {
        return Compare.eq(element, e.element());
      });

      return Option.from(raw);
    };

    var hackGenerators = function (generators) {
      console.log('generators', generators);
      var nu = function (element) {
        return generators.cell(element).element();
      };

      var prior = Option.none();

      var getOrInit = function (element, comparator) {
        return prior.fold(function () {
          var r = nu({ element: Fun.constant(element) });
          prior = Option.some({ item: element, sub: r });
          return r;
        }, function (p) {
          if (comparator(element, p.item)) {
            return p.sub;
          } else {
            var r = nu({ element: Fun.constant(element) });
            prior = Option.some({ item: element, sub: r });
            return r;
          }
        });
      };

      return {
        nu: nu,
        getOrInit: getOrInit
      };
    };


    /* END HACKING */





    var modify2 = function (operation, adjustment, post) {
      return function (wire, element, generators, direction) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {
            TableOperation.run(wire, table, cell, function (warehouse, dompos) {
              var hack = hackety(warehouse);

              var afterOp = findMe(warehouse, cell).map(function (info) {
                // we are doing insert after, therefore ...
                // find the bounds of the rowspan.
                var index = info.row();
                var insertAt = info.row();
                return ModelOperations.insertRowAt(hack, insertAt, index, Compare.eq, hackGenerators(generators));
              }).getOr(hack);

              console.log('afterOp', afterOp);

              return posthackety(afterOp);
            }, adjustment, direction);

            post(table);
          });
        });
      };
    };

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustTo;

    return {
      insertRowBefore: modify2(insertBefore, Fun.noop, Fun.noop),
      insertRowAfter: modify(RowModification.insertAfter, Fun.noop, Fun.noop),
      insertColumnBefore: modify(ColumnModification.insertBefore, resize, Fun.noop),
      insertColumnAfter: modify(ColumnModification.insertAfter, resize, Fun.noop),
      eraseColumn: modify(ColumnModification.erase, resize, prune),
      eraseRow: modify(RowModification.erase, Fun.noop, prune),
      makeColumnHeader: modify(ColumnModification.makeHeader, Fun.noop, Fun.noop),
      unmakeColumnHeader: modify(ColumnModification.unmakeHeader, Fun.noop, Fun.noop),
      makeRowHeader: modify(RowModification.makeHeader, Fun.noop, Fun.noop),
      unmakeRowHeader: modify(RowModification.unmakeHeader, Fun.noop, Fun.noop),
      mergeCells: Fun.identity
    };
  }
);
