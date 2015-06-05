define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.TableContent',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.ModelOperations',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Remove',
    'global!parseInt'
  ],

  function (Arr, Fun, Option, TableContent, TableLookup, ModelOperations, RunOperation, Adjustments, Attr, Compare, Remove, parseInt) {
    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    /* HACKING */

    var hackGenerators = function (generators) {
      console.log('generators', generators);
      var nu = function (element) {
        return generators.cell(element);
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

    var insertRowBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row();
      return ModelOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var insertRowAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row() + detail.rowspan();
      return ModelOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column() + detail.colspan();
      return ModelOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column();
      return ModelOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var headerGenerators = function (comparator, scope, tag, generators) {

      var list = [];

      var find = function (element) {
        var raw = Arr.find(list, function (x) { return comparator(x.item, element); });
        return Option.from(raw);
      };

      var makeNew = function (element) {
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

    var makeRowHeader = function (grid, detail, comparator, genWrappers) {
      return ModelOperations.replaceRow(grid, detail.row(), comparator, genWrappers);
    };

    var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
      return ModelOperations.replaceColumn(grid, detail.column(), comparator, genWrappers);
    };

    var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
      return ModelOperations.replaceRow(grid, detail.row(), comparator, genWrappers);
    };

    var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
      return ModelOperations.replaceColumn(grid, detail.column(), comparator, genWrappers);
    };

    var eraseColumn = function (grid, detail, comparator, generators) {
      return ModelOperations.deleteColumnAt(grid, detail.column());
    };

    var eraseRow = function (grid, detail, comparator, generators) {
      return ModelOperations.deleteRowAt(grid, detail.row());
    };

    var mergeCells = function (grid, mergable, comparator, _generators) {
      var cells = mergable.cells();
      TableContent.merge(cells);
      return ModelOperations.merge(grid, mergable, comparator, Fun.constant(cells[0]));
    };

    var unmergeCells = function (grid, unmergable, comparator, generators) {
      return Arr.foldr(unmergable, function (b, cell) {
        return ModelOperations.unmerge(b, cell, comparator, function (elem) {
          return generators.cell({
            element: Fun.constant(cell),
            colspan: Fun.constant(1),
            rowspan: Fun.constant(1)
          });
        });
      }, grid);
    };

    /* END HACKING */

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustTo;

    return {
      //operation, adjustment, postAction, genWrappers
      insertRowBefore: RunOperation.run(insertRowBefore, RunOperation.onCell, Fun.noop, Fun.noop, hackGenerators),
      insertRowAfter:  RunOperation.run(insertRowAfter, RunOperation.onCell, Fun.noop, Fun.noop, hackGenerators),
      insertColumnBefore:  RunOperation.run(insertColumnBefore, RunOperation.onCell, resize, Fun.noop, hackGenerators),
      insertColumnAfter:  RunOperation.run(insertColumnAfter, RunOperation.onCell, resize, Fun.noop, hackGenerators),
      eraseColumn:  RunOperation.run(eraseColumn, RunOperation.onCell, resize, prune, hackGenerators),
      eraseRow:  RunOperation.run(eraseRow, RunOperation.onCell, Fun.noop, prune, hackGenerators),
      makeColumnHeader:  RunOperation.run(makeColumnHeader, RunOperation.onCell, Fun.noop, Fun.noop, Fun.curry(headerGenerators, Compare.eq, 'row', 'th')),
      unmakeColumnHeader:  RunOperation.run(unmakeColumnHeader, RunOperation.onCell, Fun.noop, Fun.noop, Fun.curry(headerGenerators, Compare.eq, null, 'td')),
      makeRowHeader:  RunOperation.run(makeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Fun.curry(headerGenerators, Compare.eq, 'col', 'th')),
      unmakeRowHeader:  RunOperation.run(unmakeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Fun.curry(headerGenerators, Compare.eq, null, 'td')),
      mergeCells: RunOperation.run(mergeCells, RunOperation.onMergable, Fun.noop, Fun.noop, hackGenerators),
      unmergeCells: RunOperation.run(unmergeCells, RunOperation.onUnmergable, Fun.noop, Fun.noop, Fun.identity)
    };
  }
);
