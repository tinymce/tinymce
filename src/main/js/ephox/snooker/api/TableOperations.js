define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.operate.ColumnModification',
    'ephox.snooker.operate.RowModification',
    'ephox.snooker.operate.TableOperation',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Fun, TableLookup, ColumnModification, RowModification, TableOperation, Adjustments, Compare, Remove, SelectorFind) {
    /*
     * Using the current element, execute operation on the table.
     */
    var modify = function (operation, adjustment, post) {
      return function (container, element, generators) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {
            TableOperation.run(container, table, cell, function (warehouse, dompos) {
              return operation(warehouse, dompos.row(), dompos.column(), generators, Compare.eq);
            }, adjustment);

            post(table);
          });
        });
      };
    };

    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    // Only column modifications force a resizing. Everything else just tries to preserve the table as is.
    var resize = Adjustments.adjustTo;

    return {
      insertRowBefore: modify(RowModification.insertBefore, Fun.noop, Fun.noop),
      insertRowAfter: modify(RowModification.insertAfter, Fun.noop, Fun.noop),
      insertColumnBefore: modify(ColumnModification.insertBefore, resize, Fun.noop),
      insertColumnAfter: modify(ColumnModification.insertAfter, resize, Fun.noop),
      eraseColumn: modify(ColumnModification.erase, resize, prune),
      eraseRow: modify(RowModification.erase, Fun.noop, prune),
      makeColumnHeader: modify(ColumnModification.makeHeader, Fun.noop, Fun.noop),
      unmakeColumnHeader: modify(ColumnModification.unmakeHeader, Fun.noop, Fun.noop),
      makeRowHeader: modify(RowModification.makeHeader, Fun.noop, Fun.noop),
      unmakeRowHeader: modify(RowModification.unmakeHeader, Fun.noop, Fun.noop)
    };
  }
);
