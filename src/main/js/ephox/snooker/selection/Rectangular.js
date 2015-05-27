define(
  'ephox.snooker.selection.Rectangular',

  [
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells',
    'ephox.sugar.api.Compare'
  ],

  function (Obj, Fun, Structs, DetailsList, Warehouse, SpanningCells, Compare) {
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