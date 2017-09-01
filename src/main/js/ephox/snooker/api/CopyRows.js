define(
  'ephox.snooker.api.CopyRows',

  [
    'ephox.compass.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.RunOperation',
    'ephox.snooker.model.Warehouse',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Replication'
  ],

  function (Arr, Structs, TableLookup, DetailsList, RunOperation, Warehouse, Attr, Replication) {
    var uniqueRows = function (details) {
      return Arr.foldl(details, function (rest, detail) {
          return Arr.contains(rest, detail.row()) ? rest : rest.concat([detail.row()]);
      }, []).sort();
    };

    var copyRows = function (table, target) {
      var fixRowSpan = function (cell, rows, rowIndex) {
        // 3
        var rowSpan = parseInt(Attr.get(cell, 'rowspan'), 10);
        // 2
        var rows = rows.slice(rowIndex).length;
        var delta = rowSpan - rows;
        return rowSpan - delta;
      };
      var list = DetailsList.fromTable(table);
      var house = Warehouse.generate(list);
      var details = RunOperation.onCells(house, target);
      return details.bind(function (selectedCells) {
        var rows = uniqueRows(selectedCells);
        return Arr.map(rows, function (rowIndex) {
          var listRow = list[rowIndex];
          var clonedRow = Replication.deep(listRow.element());
          var clonedCells = Arr.map(TableLookup.cells(clonedRow), function (cell) {
            // Shorten rowspan length if it's longer
            var rowspan = Attr.has(cell, 'rowspan') ? fixRowSpan(cell, rows, rowIndex) : 1;
            var colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
            return Structs.detail(cell, rowspan, colspan);
          });

          // Make duplicates of the element and cells
          return Structs.rowdata(clonedRow, clonedCells, listRow.section());
        });
      });
    };
    return {
      copyRows:copyRows
    };
  }
);
