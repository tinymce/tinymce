define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.operate.ColumnInsertion',
    'ephox.snooker.operate.RowInsertion',
    'ephox.snooker.operate.TableOperation',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Option, ColumnInsertion, RowInsertion, TableOperation, Compare, Node, SelectorFind) {
    /*
     * Identify the optional cell that element represents
     */
    var detection = function (element) {
      return Arr.contains([ 'td', 'th' ], Node.name(element)) ? Option.some(element) : SelectorFind.ancestor(element, 'th,td');
    };

    /*
     * Using the current element, execute operation on the table 
     */
    var insert = function (operation) {
      return function (container, element, generators) {
        detection(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {
            TableOperation.run(container, table, cell, function (warehouse, gridpos) {
              return operation(warehouse, gridpos.row(), gridpos.column(), generators, Compare.eq);
            });
          });
        });
      };
    };

    // TODO: Erase column / row ?

    return {
      insertRowBefore: insert(RowInsertion.insertBefore),
      insertRowAfter: insert(RowInsertion.insertAfter),
      insertColumnBefore: insert(ColumnInsertion.insertBefore),
      insertColumnAfter: insert(ColumnInsertion.insertAfter)
    };
  }
);
