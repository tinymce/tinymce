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
    'ephox.snooker.operate.TableOperation',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!parseInt'
  ],

  function (Arr, Fun, Option, Options, TableLookup, ModelOperations, Warefun, Warehouse, TableOperation, Adjustments, Attr, Compare, Element, Remove, SelectorFind, Traverse, parseInt) {
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

      var _nu = function (element) {
        var colspan = Attr.has(element, 'colspan') ? parseInt(Attr.get(element, 'colspan')) : 1;
        var rowspan = Attr.has(element, 'rowspan') ? parseInt(Attr.get(element, 'rowspan')) : 1;
        return nu({
          element: Fun.constant(element),
          colspan: Fun.constant(colspan),
          rowspan: Fun.constant(rowspan)
        });
      };

      var prior = Option.none();

      var getOrInit = function (element, comparator) {
        return prior.fold(function () {
          var r = _nu(element);
          prior = Option.some({ item: element, sub: r });
          return r;
        }, function (p) {
          if (comparator(element, p.item)) {
            return p.sub;
          } else {
            var r = _nu(element);
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

    var insertRowBefore = function (grid, detail, comparator, generators) {
      var example = detail.row();
      var targetIndex = detail.row();
      return ModelOperations.insertRowAt(grid, targetIndex, example, comparator, generators);
    };

    var insertRowAfter = function (grid, detail, comparator, generators) {
      var example = detail.row();
      var targetIndex = detail.row() + detail.rowspan();
      return ModelOperations.insertRowAt(grid, targetIndex, example, comparator, generators);
    };

    var insertColumnAfter = function (grid, detail, comparator, generators) {
      var example = detail.column();
      var targetIndex = detail.column() + detail.colspan();
      return ModelOperations.insertColumnAt(grid, targetIndex, example, comparator, generators);
    };

    var insertColumnBefore = function (grid, detail, comparator, generators) {
      var example = detail.column();
      var targetIndex = detail.column();
      return ModelOperations.insertColumnAt(grid, targetIndex, example, comparator, generators);
    };

    var headerGenerators = function (comparator, generators, scope, tag) {
    
      var list = [];

      var find = function (element) {
        var raw = Arr.find(list, function (x) { return comparator(x.item, element); });
        return Option.from(raw);
      };

      var makeNew = function (element) {
        console.log('element: ', element, generators);
        var cell = generators.replace(element, tag, {
          scope: scope
        });
        list.push({ item: element, sub: cell });
        return cell;
      };
    
      var replaceOrInit = function (element, comparator) {
        return find(element).fold(function () {
          return makeNew(element);
        }, function (p) {
          return comparator(element, p.item) ? p.sub : makeNew(element);
        });
      };

      return {
        replaceOrInit: replaceOrInit
      };
    };

    var makeRowHeader = function (grid, detail, comparator, generators) {     
      return ModelOperations.replaceRow(grid, detail.row(), comparator, headerGenerators(comparator, generators, 'col', 'th'));
    };

    var makeColumnHeader = function (grid, detail, comparator, generators) {     
      return ModelOperations.replaceColumn(grid, detail.column(), comparator, headerGenerators(comparator, generators, 'row', 'th'));
    };

    var unmakeRowHeader = function (grid, detail, comparator, generators) {     
      return ModelOperations.replaceRow(grid, detail.row(), comparator, headerGenerators(comparator, generators, null, 'td'));
    };

    var unmakeColumnHeader = function (grid, detail, comparator, generators) {     
      return ModelOperations.replaceColumn(grid, detail.column(), comparator, headerGenerators(comparator, generators, null, 'td'));
    };

    var eraseColumn = function (grid, detail, comparator, generators) {
      return ModelOperations.deleteColumnAt(grid, detail.column());
    };

    var eraseRow = function (grid, detail, comparator, generators) {
      return ModelOperations.deleteRowAt(grid, detail.row());
    };

    /* END HACKING */





    var modify2 = function (operation, adjustment, post, _genbuilder) {
      var genbuilder = _genbuilder !== undefined ? _genbuilder : hackGenerators;
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
                return operation(hack, info, Compare.eq, genbuilder(generators));
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
      insertRowBefore: modify2(insertRowBefore, Fun.noop, Fun.noop),
      insertRowAfter: modify2(insertRowAfter, Fun.noop, Fun.noop),
      insertColumnBefore: modify2(insertColumnBefore, resize, Fun.noop),
      insertColumnAfter: modify2(insertColumnAfter, resize, Fun.noop),
      eraseColumn: modify2(eraseColumn, resize, prune),
      eraseRow: modify2(eraseRow, Fun.noop, prune),
      makeColumnHeader: modify2(makeColumnHeader, Fun.noop, Fun.noop, Fun.identity),
      unmakeColumnHeader: modify2(unmakeColumnHeader, Fun.noop, Fun.noop, Fun.identity),
      makeRowHeader: modify2(makeRowHeader, Fun.noop, Fun.noop, Fun.identity),
      unmakeRowHeader: modify2(unmakeRowHeader, Fun.noop, Fun.noop, Fun.identity),
      mergeCells: Fun.identity
    };
  }
);
