define(
  'ephox.snooker.selection.Rectangular',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells',
    'ephox.sugar.api.Compare',
    'global!Math'
  ],

  function (Fun, Structs, DetailsList, Warehouse, SpanningCells, Compare, Math) {
    var getBox = function (table, startCell, finishCell) {
      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);

      var startCoords = Warehouse.findItem(warehouse, startCell, Compare.eq);
      var finishCoords = Warehouse.findItem(warehouse, finishCell, Compare.eq);
      return startCoords.bind(function (sc) {
        return finishCoords.map(function (fc) {
          return {
            startCol: Fun.constant(sc.column()),
            finishRow: Fun.constant(fc.row() + fc.rowspan() - 1),
            finishCol: Fun.constant(fc.column() + fc.colspan() - 1),
            startRow: Fun.constant(sc.row()),
            warehouse: warehouse
          };
        });
      });
    };

    var isRectangular = function (table, startCell, finishCell) {
      var result = getBox(table, startCell, finishCell).map(function (info) {

        var startRow = Math.min(info.startRow(), info.finishRow());
        var finishRow = Math.max(info.startRow(), info.finishRow());

        var startCol = Math.min(info.startCol(), info.finishCol());
        var finishCol = Math.max(info.startCol(), info.finishCol());

        var isRect = true;
        for (var i = startRow; i<=finishRow; i++) {
          for (var j = startCol; j<=finishCol; j++ ) {
            var boundingBox = Structs.bounds({
              startRow: info.startRow(),
              startCol : info.startCol(),
              finishRow : info.finishRow(),
              finishCol : info.finishCol()
            });

            var cell = Structs.cell({
              row : i,
              col : j
            });

            isRect = isRect && SpanningCells.isSpanning(info.warehouse.access(), cell, boundingBox);
          }
        }

        return isRect;
      }).getOr(false);

      return {
        isRect: Fun.constant(result)
      };
    };

    return {
      isRectangular: isRectangular
    };
  }
);