define(
  'ephox.snooker.selection.Rectangular',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.CellBounds',
    'ephox.sugar.api.Compare',
    'global!Math'
  ],

  function (Structs, Warehouse, CellBounds, Compare, Math) {
    var getBounds = function (detailA, detailB) {
      return Structs.bounds({
        startCol: Math.min(detailA.column(), detailB.column()),
        finishCol: Math.max(detailA.column() + detailA.colspan() - 1, detailB.column() + detailB.colspan() - 1),
        startRow: Math.min(detailA.row(), detailB.row()),
        finishRow: Math.max(detailA.row() + detailA.rowspan() - 1 , detailB.row() + detailB.rowspan() - 1)
      });
    };

    var getAnyBox = function (warehouse, startCell, finishCell) {
      var startCoords = Warehouse.findItem(warehouse, startCell, Compare.eq);
      var finishCoords = Warehouse.findItem(warehouse, finishCell, Compare.eq);
      return startCoords.bind(function (sc) {
        return finishCoords.map(function (fc) {
          return getBounds(sc, fc);
        });
      });
    };

    var getBox = function (warehouse, startCell, finishCell) {
      return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds) {
        return CellBounds.isRectangular(warehouse, bounds);
      });
    };

    return {
      getAnyBox: getAnyBox,
      getBox: getBox
    };
  }
);