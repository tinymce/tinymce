define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Generators',
    'ephox.snooker.api.TableContent',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.operate.MergingOperations',
    'ephox.snooker.operate.ModificationOperations',
    'ephox.snooker.operate.TransformOperations',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Remove',
    'global!parseInt'
  ],

  function (Arr, Fun, Generators, TableContent, TableLookup, RunOperation, MergingOperations, ModificationOperations, TransformOperations, Adjustments, Remove, parseInt) {
    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    var insertRowBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row();
      return ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var insertRowAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row() + detail.rowspan();
      return ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column() + detail.colspan();
      return ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column();
      return ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers);
    };

    var makeRowHeader = function (grid, detail, comparator, genWrappers) {
      return TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers);
    };

    var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
      return TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers);
    };

    var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
      return TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers);
    };

    var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
      return TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers);
    };

    var eraseColumn = function (grid, detail, comparator, generators) {
      return ModificationOperations.deleteColumnAt(grid, detail.column());
    };

    var eraseRow = function (grid, detail, comparator, generators) {
      return ModificationOperations.deleteRowAt(grid, detail.row());
    };

    var mergeCells = function (grid, mergable, comparator, _generators) {
      var cells = mergable.cells();
      TableContent.merge(cells);
      return MergingOperations.merge(grid, mergable, comparator, Fun.constant(cells[0]));
    };

    var unmergeCells = function (grid, unmergable, comparator, generators) {
      return Arr.foldr(unmergable, function (b, cell) {
        return MergingOperations.unmerge(b, cell, comparator, generators(cell));
      }, grid);
    };

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustTo;

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
      unmergeCells: RunOperation.run(unmergeCells, RunOperation.onUnmergable, resize, Fun.noop, Generators.merging)
    };
  }
);
