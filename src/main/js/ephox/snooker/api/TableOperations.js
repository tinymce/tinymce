define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'ephox.snooker.api.Generators',
    'ephox.snooker.api.Structs',
    'ephox.snooker.api.TableContent',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.model.TableMerge',
    'ephox.snooker.model.Transitions',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.MergingOperations',
    'ephox.snooker.operate.ModificationOperations',
    'ephox.snooker.operate.TransformOperations',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Remove',
    'global!parseInt'
  ],

  function (Arr, Fun, Option, Struct, Generators, Structs, TableContent, TableLookup, DetailsList, RunOperation, TableMerge, Transitions, Warehouse, MergingOperations, ModificationOperations, TransformOperations, Adjustments, Remove, parseInt) {
    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    var outcome = Struct.immutable('grid', 'cursor');

    var elementFromGrid = function (grid, row, column) {
      return findIn(grid, row, column).orThunk(function () {
        return findIn(grid, 0, 0);
      });
    };

    var findIn = function (grid, row, column) {
      return Option.from(grid[row]).bind(function (r) {
        return Option.from(r[column]);
      });
    };

    var bundle = function (grid, row, column) {
      return outcome(grid, findIn(grid, row, column));
    };

    var insertRowBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row();
      var newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, targetIndex, detail.column());
    };

    var insertRowAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row() + detail.rowspan();
      var newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, targetIndex, detail.column());
    };

    var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column() + detail.colspan();
      var newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, detail.row(), targetIndex);
    };

    var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column();
      var newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, detail.row(), targetIndex);
    };

    var makeRowHeader = function (grid, detail, comparator, genWrappers) {
      var newGrid = TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
      return bundle(newGrid, detail.row(), detail.column());
    };

    var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
      var newGrid = TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
      return bundle(newGrid, detail.row(), detail.column());
    };

    var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
      var newGrid =  TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
      return bundle(newGrid, detail.row(), detail.column());
    };

    var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
      var newGrid = TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
      return bundle(newGrid, detail.row(), detail.column());
    };

    var eraseColumn = function (grid, detail, comparator, _genWrappers) {
      var newGrid = ModificationOperations.deleteColumnAt(grid, detail.column());
      var cursor = elementFromGrid(newGrid, detail.row(), detail.column());
      return outcome(newGrid, cursor);
    };

    var eraseRow = function (grid, detail, comparator, _genWrappers) {
      var newGrid = ModificationOperations.deleteRowAt(grid, detail.row());
      var cursor = elementFromGrid(newGrid, detail.row(), detail.column());
      return outcome(newGrid, cursor);
    };

    var mergeCells = function (grid, mergable, comparator, _genWrappers) {
      var cells = mergable.cells();
      TableContent.merge(cells);
      var newGrid = MergingOperations.merge(grid, mergable.bounds(), comparator, Fun.constant(cells[0]));
      return outcome(newGrid, Option.from(cells[0]));
    };

    var unmergeCells = function (grid, unmergable, comparator, genWrappers) {
      var newGrid = Arr.foldr(unmergable, function (b, cell) {
        return MergingOperations.unmerge(b, cell, comparator, genWrappers.combine(cell));
      }, grid);
      return outcome(newGrid, Option.from(unmergable[0]));
    };

    var pasteCells = function (grid, pasteDetails, comparator, genWrappers) {
      var gridify = function (table, generators) {
        var list = DetailsList.fromTable(table);
        var wh = Warehouse.generate(list);
        return Transitions.toGrid(wh, generators);
      };
      var gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
      var startAddress = Structs.address(pasteDetails.row(), pasteDetails.column());
      var mergedGrid = TableMerge.merge(startAddress, grid, gridB, pasteDetails.generators(), comparator);
      return mergedGrid.fold(function () {
        return outcome(grid, Option.some(pasteDetails.element()));
      }, function (nuGrid) {
        var cursor = elementFromGrid(nuGrid, pasteDetails.row(), pasteDetails.column());
        return outcome(nuGrid, cursor);
      });
    };

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustWidthTo;

    return {
      insertRowBefore: RunOperation.run(insertRowBefore, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification),
      insertRowAfter:  RunOperation.run(insertRowAfter, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification),
      insertColumnBefore:  RunOperation.run(insertColumnBefore, RunOperation.onCell, resize, Fun.noop, Generators.modification),
      insertColumnAfter:  RunOperation.run(insertColumnAfter, RunOperation.onCell, resize, Fun.noop, Generators.modification),
      eraseColumn:  RunOperation.run(eraseColumn, RunOperation.onCell, resize, prune, Generators.modification),
      eraseRow:  RunOperation.run(eraseRow, RunOperation.onCell, Fun.noop, prune, Generators.modification),
      makeColumnHeader:  RunOperation.run(makeColumnHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform('row', 'th')),
      unmakeColumnHeader:  RunOperation.run(unmakeColumnHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td')),
      makeRowHeader:  RunOperation.run(makeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform('col', 'th')),
      unmakeRowHeader:  RunOperation.run(unmakeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td')),
      mergeCells: RunOperation.run(mergeCells, RunOperation.onMergable, Fun.noop, Fun.noop, Generators.merging),
      unmergeCells: RunOperation.run(unmergeCells, RunOperation.onUnmergable, resize, Fun.noop, Generators.merging),
      pasteCells: RunOperation.run(pasteCells, RunOperation.onPaste, resize, Fun.noop, Generators.modification)
    };
  }
);
