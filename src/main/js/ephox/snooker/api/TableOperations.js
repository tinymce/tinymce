define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.lid.Jam',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Generators',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.operate.MergingOperations',
    'ephox.snooker.operate.ModificationOperations',
    'ephox.snooker.operate.TransformOperations',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse',
    'global!parseInt'
  ],

  function (Arr, Jam, Fun, Option, Generators, TableLookup, RunOperation, MergingOperations, ModificationOperations, TransformOperations, Adjustments, Attr, Compare, Element, InsertAll, Node, Remove, Traverse, parseInt) {
    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    /* HACKING */
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

    var mergeContent = function (cells) {
      var readContent = function () {
        var kin = Arr.bind(cells, function (cell) {
          var children = Traverse.children(cell);
          // Exclude empty cells.
          return children.length > 1 || (children.length == 1 && Node.name(children[0]) !== 'br') ? [ children ] : [];
        });
        return Jam.intersperseThunk(kin, function () {
          return [ Element.fromTag('br') ];
        });
      };

      var contents = Arr.flatten(readContent());
      Remove.empty(cells[0]);
      InsertAll.append(cells[0], contents);
    };

    var mergeCells = function (grid, mergable, comparator, _generators) {
      var cells = mergable.cells();
      mergeContent(cells);
      return MergingOperations.merge(grid, mergable, comparator, Fun.constant(cells[0]));
    };

    var unmergeCells = function (grid, unmergable, comparator, generators) {
      console.log('unmergable', unmergable[0]);

      return Arr.foldr(unmergable, function (b, cell) {
        return MergingOperations.unmerge(b, cell, comparator, generators(cell));
      }, grid);
    };

    /* END HACKING */

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustTo;

    return {
      //operation, adjustment, postAction, genWrappers
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
      unmergeCells: RunOperation.run(unmergeCells, RunOperation.onUnmergable, Fun.noop, Fun.noop, Generators.merging)
    };
  }
);
