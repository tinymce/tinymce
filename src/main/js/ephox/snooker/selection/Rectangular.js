define(
  'ephox.snooker.selection.Rectangular',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.violin.util.Validate'
  ],

  function (Arr, Obj, Fun, Structs, DetailsList, Warehouse, SpanningCells, Attr, Compare, SelectorFilter, SelectorFind, Validate) {




    // Given a cell find the position of the cell within the row/col
    // To do this:
    // 1. Find the row where the cell is contained. (tr)
    // 2. Find all the cells within that row (td,th)
    // 3. Find in which position the cell is (Arr.findIndex)
    // 4. Sum up the position of the cell itself and the cells before with its colspan

    var findColPosition = function (cell) {
      return SelectorFind.ancestor(cell, 'tr').bind(function (row) {
        var cells = SelectorFilter.children(row, 'td,th');
        var compare = Fun.curry(Compare.eq, cell);
        var index = Arr.findIndex(cells, compare);
        var previous = cells.slice(0, index);
        return Arr.foldl(previous, function (acc, prevCell) {
          var colspan = parseInt(Attr.get(prevCell, 'colspan'), 10);
          return acc += Validate.pNum(colspan) ? colspan : 1;
        }, 0);
      });
    };
    // Given a cell, find the row position of that cell.
    // 1. Find the row belonging to the cell
    // 2. Find the rows beloging to the tabls (tr)
    // 3. Find which row the cell is in.
    // 4. Sum up the number of rows before the cell, plus the cell rowspan
    //    Why only the rowspan?
    //      Because in HTML the number of rows are going to be kept to have a valid rowspan.
    //      Even if a cell has a colspan/rowspan, the row cannot be skipped.

    var findRowPosition = function (cell) {
      return SelectorFind.ancestor(cell, 'tr').bind(function (row) {
        return SelectorFind.ancestor(row, 'table').bind(function (table) {
          var rows = SelectorFilter.descendants(table, 'tr');
          var compare = Fun.curry(Compare.eq, row);
          var index = Arr.findIndex(rows, compare);
          var previous = rows.slice(0, index);
          var rowspan = parseInt(Attr.get(cell, 'rowspan'), 10);
          var rowspanVal = Validate.pNum(rowspan) ? rowspan : 0;

          return previous.length + rowspanVal;
        });
      });
    };

    var isRectangular = function (table, startCell, finishCell) {
      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);

      var comparatorS = Fun.curry(Compare.eq, startCell);
      var comparatorF = Fun.curry(Compare.eq, finishCell);
      var startCoords;
      var finishCoords;
      Obj.each(warehouse.access(), function (current, coords) {
        if (comparatorS(current.element()) === true)
          startCoords = coords;
        else if (comparatorF(current.element()) === true)
          finishCoords = coords;
        else { /* skip */ }
      });

      console.log('startCoords',startCoords);
      console.log('finishCoords',finishCoords);
      window.startCoordsdebug = startCoords;
      console.log("startCoords ", startCoords);

      // Scan the outside of the grid


      var feedA = Structs.spanningCell({
        structure : warehouse.access(),
        startRow: 1,
        startCol : 1,
        finishRow : 3,
        finishCol : 3,
        cellRow : 2,
        cellCol : 2
      });
      var resultA = SpanningCells.isSpanning(feedA);

    };

    return {
      isRectangular: isRectangular
    };
  }
);