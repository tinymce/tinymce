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
    'ephox.syrup.api.Remove'
  ],

  function (Arr, Fun, Option, Struct, Generators, Structs, TableContent, TableLookup, DetailsList, RunOperation, TableMerge, Transitions, Warehouse, MergingOperations, ModificationOperations, TransformOperations, Adjustments, Remove) {
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
        return Option.from(r.cells()[column]).bind(function (c) {
          return Option.from(c.element());
        });
      });
    };

    var bundle = function (grid, row, column) {
      return outcome(grid, findIn(grid, row, column));
    };

    var uniqueRows = function (details) {
      return Arr.foldl(details, function (rest, detail) {
          return Arr.contains(rest, detail.row()) ? rest : rest.concat([detail.row()]);
      }, []).sort();
    };

    var uniqueColumns = function (details) {
      return Arr.foldl(details, function (rest, detail) {
          return Arr.contains(rest, detail.column()) ? rest : rest.concat([detail.column()]);
      }, []).sort();
    };

    var insertRowBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row();
      var newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, targetIndex, detail.column());
    };

    var insertRowsBefore = function (grid, details, comparator, genWrappers) {
      var example = details[0].row();
      var targetIndex = details[0].row();
      var rows = uniqueRows(details);
      var newGrid = ModificationOperations.insertRowsAt(grid, targetIndex, rows.length, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, targetIndex, details[0].column());
    };

    var insertRowAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.row();
      var targetIndex = detail.row() + detail.rowspan();
      var newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, targetIndex, detail.column());
    };

    var insertRowsAfter = function (grid, details, comparator, genWrappers) {
      var example = details[details.length - 1].row();
      var targetIndex = details[details.length - 1].row() + details[details.length - 1].rowspan();
      var rows = uniqueRows(details);
      var newGrid = ModificationOperations.insertRowsAt(grid, targetIndex, rows.length, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, targetIndex, details[0].column());
    };

    var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column();
      var newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, detail.row(), targetIndex);
    };

    var insertColumnsBefore = function (grid, details, comparator, genWrappers) {
      var example = details[0].column();
      var targetIndex = details[0].column();
      var columns = uniqueColumns(details);
      var newGrid = ModificationOperations.insertColumnsAt(grid, targetIndex, columns.length, example, comparator, genWrappers.add);
      return bundle(newGrid, details[0].row(), targetIndex);
    };

    var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
      var example = detail.column();
      var targetIndex = detail.column() + detail.colspan();
      var newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
      return bundle(newGrid, detail.row(), targetIndex);
    };

    var insertColumnsAfter = function (grid, details, comparator, genWrappers) {
      var example = details[details.length - 1].column();
      var targetIndex = details[details.length - 1].column()  + details[details.length - 1].colspan();
      var columns = uniqueColumns(details);
      var newGrid = ModificationOperations.insertColumnsAt(grid, targetIndex, columns.length, example, comparator, genWrappers.add);
      return bundle(newGrid, details[0].row(), targetIndex);
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

    var splitCellIntoColumns = function (grid, detail, comparator, genWrappers) {
      var newGrid = ModificationOperations.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
      return bundle(newGrid, detail.row(), detail.column());
    };

    var splitCellIntoRows = function (grid, detail, comparator, genWrappers) {
      var newGrid = ModificationOperations.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
      return bundle(newGrid, detail.row(), detail.column());
    };

    var eraseColumns = function (grid, details, comparator, _genWrappers) {
      var columns = uniqueColumns(details);

      var newGrid = ModificationOperations.deleteColumnsAt(grid, columns[0], columns[columns.length - 1]);
      var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
      return outcome(newGrid, cursor);
    };

    var eraseRows = function (grid, details, comparator, _genWrappers) {
      var rows = uniqueRows(details);

      var newGrid = ModificationOperations.deleteRowsAt(grid, rows[0], rows[rows.length - 1]);
      var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
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

    var pasteRows = function (grid, pasteDetails, comparator, genWrappers) {
      var gridify = function (details, generators) {
        var wh = Warehouse.generate(details);
        return Transitions.toGrid(wh, generators);
      };
      var example = pasteDetails.cells[0].row();
      var gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
      var mergedGrid = TableMerge.insert(example, grid, gridB, pasteDetails.generators(), comparator);
      var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
      return outcome(mergedGrid, cursor);
    };

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustWidthTo;

    return {
      insertRowBefore: RunOperation.run(insertRowBefore, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification),
      insertRowsBefore: RunOperation.run(insertRowsBefore, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification),
      insertRowAfter:  RunOperation.run(insertRowAfter, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification),
      insertRowsAfter: RunOperation.run(insertRowsAfter, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification),
      insertColumnBefore:  RunOperation.run(insertColumnBefore, RunOperation.onCell, resize, Fun.noop, Generators.modification),
      insertColumnsBefore: RunOperation.run(insertColumnsBefore, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification),
      insertColumnAfter:  RunOperation.run(insertColumnAfter, RunOperation.onCell, resize, Fun.noop, Generators.modification),
      insertColumnsAfter: RunOperation.run(insertColumnsAfter, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification),
      splitCellIntoColumns:  RunOperation.run(splitCellIntoColumns, RunOperation.onCell, resize, Fun.noop, Generators.modification),
      splitCellIntoRows:  RunOperation.run(splitCellIntoRows, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification),
      eraseColumns:  RunOperation.run(eraseColumns, RunOperation.onCells, resize, prune, Generators.modification),
      eraseRows:  RunOperation.run(eraseRows, RunOperation.onCells, Fun.noop, prune, Generators.modification),
      makeColumnHeader:  RunOperation.run(makeColumnHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform('row', 'th')),
      unmakeColumnHeader:  RunOperation.run(unmakeColumnHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td')),
      makeRowHeader:  RunOperation.run(makeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform('col', 'th')),
      unmakeRowHeader:  RunOperation.run(unmakeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td')),
      mergeCells: RunOperation.run(mergeCells, RunOperation.onMergable, Fun.noop, Fun.noop, Generators.merging),
      unmergeCells: RunOperation.run(unmergeCells, RunOperation.onUnmergable, resize, Fun.noop, Generators.merging),
      pasteCells: RunOperation.run(pasteCells, RunOperation.onPaste, resize, Fun.noop, Generators.modification),
      pasteRowsBefore: RunOperation.run(pasteRows, RunOperation.onPasteRows, Fun.noop, Fun.noop, Generators.modification)
    };
  }
);
