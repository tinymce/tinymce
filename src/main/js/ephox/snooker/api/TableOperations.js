define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.operate.ColumnModification',
    'ephox.snooker.operate.RowInsertion',
    'ephox.snooker.operate.TableOperation',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, Option, TableLookup, ColumnModification, RowInsertion, TableOperation, Compare, Node, Remove, SelectorFind) {
    /*
     * Identify the optional cell that element represents
     */
    var detection = function (element) {
      return Arr.contains([ 'td', 'th' ], Node.name(element)) ? Option.some(element) : SelectorFind.ancestor(element, 'th,td');
    };

    /*
     * Using the current element, execute operation on the table 
     */
    var modify = function (operation, post) {
      return function (container, element, generators) {
        detection(element).each(function (cell) {
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

    // TODO: Erase column / row ?

    return {
      insertRowBefore: modify(RowInsertion.insertBefore, Fun.noop),
      insertRowAfter: modify(RowInsertion.insertAfter, Fun.noop),
      insertColumnBefore: modify(ColumnModification.insertBefore, Fun.noop),
      insertColumnAfter: modify(ColumnModification.insertAfter, Fun.noop),
      eraseColumn: modify(ColumnModification.erase, prune)
    };
  }
);
