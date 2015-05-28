define(
  'ephox.snooker.api.TableOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.Warefun',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.ColumnModification',
    'ephox.snooker.operate.RowModification',
    'ephox.snooker.operate.TableOperation',
    'ephox.snooker.resize.Adjustments',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, TableLookup, Warefun, Warehouse, ColumnModification, RowModification, TableOperation, Adjustments, Compare, Remove, SelectorFind) {
    /*
     * Using the current element, execute operation on the table.
     */
    var modify = function (operation, adjustment, post) {
      return function (wire, element, generators, direction) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {
            TableOperation.run(wire, table, cell, function (warehouse, dompos) {
              return operation(warehouse, dompos.row(), dompos.column(), generators, Compare.eq);
            }, adjustment, direction);

            post(table);
          });
        });
      };
    };

    var getElementGrid = function (warehouse, sColspan, sRowspan, fColspan, fRowspan, leadCol, leadRow) {

      var grid = [];
      for (var r = 0; r < warehouse.rows(); r++) {
        grid[r] = [];
        for (var c = 0; c < warehouse.columns(); c++) {
          var normal = Warehouse.getAt(warehouse, r, c).map(function (e) { return e.element(); }).getOr(undefined);
          grid[r][c] = r>=sRowspan&&r<=fRowspan&&c>=sColspan&&c<=fColspan ? Warehouse.getAt(warehouse, leadRow, leadRow).map(function (e) { return e.element(); }).getOr(undefined) : normal;
        }
      }
      return grid;
    };

    var multi = function (_operation, _adjustment, _post) {
      return function (wire, element, generators, direction) {
        TableLookup.cell(element).each(function (cell) {
          SelectorFind.ancestor(cell, 'table').each(function (table) {

            var sColspan = 0;
            var sRowspan = 1;
            var fColspan = 2;
            var fRowspan = 2;

            var leadCol = 1;
            var leadRow = 2;

            TableOperation.run(wire, table, cell, function (warehouse, dompos) {
              var grid = getElementGrid(warehouse.grid(), sColspan, sRowspan, fColspan, fRowspan, leadCol, leadRow);
              var fun = Warefun.render(grid, Compare.eq);

              // now we have to correlate the rows
              var lists = warehouse.all();
              var hackedFun = Arr.map(fun, function (f, fi) {
                return {
                  element: lists[fi].element,
                  cells: f.cells
                };
              });


              return hackedFun;
            }, _adjustment,
            direction);
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
      unmakeRowHeader: modify(RowModification.unmakeHeader, Fun.noop, Fun.noop),
      mergeCells: multi(Fun.noop, Fun.noop)
    };
  }
);
