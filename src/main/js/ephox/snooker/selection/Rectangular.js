define(
  'ephox.snooker.selection.Rectangular',

  [
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells',
    'ephox.sugar.api.Compare'
  ],

  function (Obj, Fun, Struct, Structs, DetailsList, Warehouse, SpanningCells, Compare) {
    var coords = Struct.immutableBag([ 'row', 'col' ], []);
    var getCoords = function (pair) {
      var row = pair.split(',')[0];
      var col = pair.split(',')[1];
      return coords({
        row: row,
        col: col
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
          startCoords = getCoords(coords);
        else if (comparatorF(current.element()) === true)
          finishCoords = getCoords(coords);
        else { /* skip */ }
      });

      var isRect = true;
      for (var i = startCoords.row(); i<finishCoords.row(); i++) {
        for (var j = startCoords.col(); j<finishCoords.col(); j++ ) {
          var feedA = Structs.spanningCell({
            structure : warehouse.access(),
            startRow: 1,
            startCol : 1,
            finishRow : 3,
            finishCol : 3,
            cellRow : i,
            cellCol : j
          });

          isRect = isRect && SpanningCells.isSpanning(feedA);
        }
      }

      return {
        isRect: Fun.constant(isRect)
      };

      // Scan the outside of the grid



    };

    return {
      isRectangular: isRectangular
    };
  }
);