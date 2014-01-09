define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.operate.ColumnModification',
    'ephox.snooker.operate.RowModification',
    'ephox.snooker.operate.TableOperation',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, Option, TableLookup, ColumnModification, RowModification, TableOperation, Compare, Node, Remove, SelectorFind) {
    /*
     * Using the current element, execute operation on the table.
     */
    var modify = function (operation, post) {
      return function (container, element, generators) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {
            TableOperation.run(container, table, cell, function (warehouse, gridpos) {
              return operation(warehouse, gridpos.row(), gridpos.column(), generators, Compare.eq);
            });

            post(table);
          });
        });
      };
    };

    var prune = function (table) {
      var cells = TableLookup.cells(table);
      if (cells.length === 0) Remove.remove(table);
    };

    return {
      insertRowBefore: modify(RowModification.insertBefore, Fun.noop),
      insertRowAfter: modify(RowModification.insertAfter, Fun.noop),
      insertColumnBefore: modify(ColumnModification.insertBefore, Fun.noop),
      insertColumnAfter: modify(ColumnModification.insertAfter, Fun.noop),
      eraseColumn: modify(ColumnModification.erase, prune),
      eraseRow: modify(RowModification.erase, prune)
    };
  }
);
