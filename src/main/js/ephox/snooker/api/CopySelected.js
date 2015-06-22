define(
  'ephox.snooker.api.CopySelected',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.scullion.Struct',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.Selectors'
  ],

  function (Arr, Obj, Struct, DetailsList, Warehouse, Attr, Css, Element, Insert, Remove, SelectorFilter, Selectors) {
    var stats = Struct.immutable('minRow', 'minCol', 'maxRow', 'maxCol');

    var findSelectedStats = function (house, isSelected) {
      var totalColumns = house.grid().columns();
      var totalRows = house.grid().rows();

      /* Refactor into a method returning a struct to hide the mutation */
      var minRow = totalRows;
      var minCol = totalColumns;
      var maxRow = 0;
      var maxCol = 0;
      Obj.each(house.access(), function (detail) {
        if (isSelected(detail)) {
          var startRow = detail.row();
          var endRow = startRow + detail.rowspan() - 1;
          var startCol = detail.column();
          var endCol = startCol + detail.colspan() - 1;
          if (startRow < minRow) minRow = startRow;
          else if (endRow > maxRow) maxRow = endRow;

          if (startCol < minCol) minCol = startCol;
          else if (endCol > maxCol) maxCol = endCol;
        }
      });
      return stats(minRow, minCol, maxRow, maxCol);
    };

    var makeCell = function (list, seenSelected, rowIndex) {
      // no need to check bounds, as anything outside this index is removed in the nested for loop
      var row = list[rowIndex].element();
      var td = Element.fromTag('td');
      Insert.append(td, Element.fromText('\u00A0'));
      var f = seenSelected ? Insert.append : Insert.prepend;
      f(row, td);
    };

    var fillInGaps = function (list, house, stats, isSelected) {
      var totalColumns = house.grid().columns();
      var totalRows = house.grid().rows();
      // unselected cells have been deleted, now fill in the gaps in the model
      for (var i = 0; i < totalRows; i++) {
        var seenSelected = false;
        for (var j = 0; j < totalColumns; j++) {
          if (!(i < stats.minRow() || i > stats.maxRow() || j < stats.minCol() || j > stats.maxCol())) {
            // if there is a hole in the table itself, or it's an unselected position, we need a cell
            var needCell = Warehouse.getAt(house, i, j).filter(isSelected).isNone();
            if (needCell) makeCell(list, seenSelected, i);
            // if we didn't need a cell, this position must be selected, so set the flag
            else seenSelected = true;
          }
        }
      }
    };

    var clean = function (table, stats) {
      // can't use :empty selector as that will not include TRs made up of whitespace
      var emptyRows = Arr.filter(SelectorFilter.descendants(table, 'tr'), function (row) {
        // there is no sugar method for this, and Traverse.children() does too much processing
        return row.dom().childElementCount === 0;
      });
      Arr.each(emptyRows, Remove.remove);

      // If there is only one column, or only one row, delete all the colspan/rowspan
      if (stats.minCol() === stats.maxCol() || stats.minRow() === stats.maxRow()) {
        Arr.each(SelectorFilter.descendants(table, 'th,td'), function (cell) {
          Attr.remove(cell, 'rowspan');
          Attr.remove(cell, 'colspan');
        });
      }

      Attr.remove(table, 'width');
      Attr.remove(table, 'height');
      Css.remove(table, 'width');
      Css.remove(table, 'height');
    };

    var extract = function (table, selectedClass) {
      var selected = '.' + selectedClass;
      var isSelected = function (detail) {
        return Selectors.is(detail.element(), selected);
      };

      var list = DetailsList.fromTable(table);
      var house = Warehouse.generate(list);

      var stats = findSelectedStats(house, isSelected);

      // remove unselected cells
      var selector = 'th:not(' + selected + ')' + ',td:not(' + selected + ')';
      var unselectedCells = SelectorFilter.descendants(table, selector);
      Arr.each(unselectedCells, Remove.remove);

      fillInGaps(list, house, stats, isSelected);

      clean(table, stats);

      return table;
    };

    return {
      extract: extract
    };
  }
);