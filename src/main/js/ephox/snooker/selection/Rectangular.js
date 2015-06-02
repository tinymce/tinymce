define(
  'ephox.snooker.selection.Rectangular',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells',
    'ephox.sugar.api.Compare',
    'global!Math'
  ],

  function (Fun, Option, Structs, DetailsList, Warehouse, SpanningCells, Compare, Math) {
    var getBox = function (table, startCell, finishCell) {
      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);

      var startCoords = Warehouse.findItem(warehouse, startCell, Compare.eq);
      var finishCoords = Warehouse.findItem(warehouse, finishCell, Compare.eq);
      return startCoords.bind(function (sc) {
        return finishCoords.map(function (fc) {

          var leftCol = Math.min(sc.column(), fc.column());
          var rightCol = Math.max(sc.column() + sc.colspan() - 1, fc.column() + fc.colspan() - 1);

          var topRow = Math.min(sc.row(), fc.row());
          var bottomRow = Math.max(sc.row() + sc.rowspan() - 1 , fc.row() + fc.rowspan() - 1);

          console.log('leftCol', leftCol, 'rightCol', rightCol);


          return {
            startCol: Fun.constant(leftCol),
            finishCol: Fun.constant(rightCol),

            startRow: Fun.constant(topRow),
            finishRow: Fun.constant(bottomRow),
            // This will need to be a fun constant.
            warehouse: warehouse
          };
        });
      });
    };

    var isRectangular = function (table, startCell, finishCell) {
      return getBox(table, startCell, finishCell).bind(function (info) {

        var boundingBox = Structs.bounds({
          startRow: info.startRow(),
          startCol : info.startCol(),
          finishRow : info.finishRow(),
          finishCol : info.finishCol()
        });

        var isRect = true;
        for (var i = info.startRow(); i<=info.finishRow(); i++) {
          for (var j = info.startCol(); j<=info.finishCol(); j++ ) {
            var cell = Structs.cell({
              row : i,
              col : j
            });
            isRect = isRect && SpanningCells.isSpanning(info.warehouse.access(), cell, boundingBox);
          }
        }

        return isRect ? Option.some(info) : Option.none();
      });
    };

    return {
      getBox: getBox,
      isRectangular: isRectangular
    };
  }
);