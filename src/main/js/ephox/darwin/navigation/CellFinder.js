define(
  'ephox.darwin.navigation.CellFinder',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.ElementFind',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Obj, Fun, Option, DetailsList, Warehouse, Compare, ElementFind, SelectorFilter, SelectorFind) {
    // IMPROVEMENT: Implement colspans and rowspans. Note, this will probably interact with snooker.
    var findInTable = function (cell) {
      return ElementFind.descendantsInAncestor(cell, 'tr', 'td,th').bind(function (cellInfo) {
        return ElementFind.descendantsInAncestor(cellInfo.ancestor(), 'table', 'tr').map(function (rowInfo) {
          return {
            rowIndex: rowInfo.index,
            colIndex: cellInfo.index
          };
        });
      });
    };

    var findCell = function (cell) {
      return SelectorFind.ancestor(cell, 'table').bind(function (table) {
        var list = DetailsList.fromTable(table);

        var warehouse = Warehouse.generate(list);
        // console.log('warehouse', warehouse.access());


        var access = warehouse.access();

        var findMe = Arr.find(Obj.values(access), function (a) {
          return Compare.eq(a.element(), cell);
        });

        return Option.from(findMe).map(function (detail) {
          return {
            detail: Fun.constant(detail),
            warehouse: Fun.constant(warehouse)
          };
        });
      });
    };

    var moveBy = function (cell, row, column) {
      return findCell(cell).bind(function (info) {
        var detail = info.detail();
        var grid = info.warehouse();

        var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
        var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();

        var dest = Warehouse.getAt(grid, startRow + row, startCol + column);
        return dest.map(function (d) { return d.element(); });
      });
    };

    var gotoCell = function (table, rowIndex, colIndex) {
      var rows = SelectorFilter.descendants(table, 'tr');
      return Option.from(rows[rowIndex]).bind(function (row) {
        var cells = SelectorFilter.children(row, 'td,th');
        return Option.from(cells[colIndex]);
      });
    };

    return {
      findInTable: findInTable,
      gotoCell: gotoCell,
      moveBy: moveBy
    };
  }
);