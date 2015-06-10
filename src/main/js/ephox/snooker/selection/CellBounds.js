define(
  'ephox.snooker.selection.CellBounds',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.model.Warehouse'
  ],

  function (Fun, Option, Warehouse) {
    // Note, something is considered within the selection if it overlaps any part of the bounds. It does not have to be completely within it.
    var inSelection = function (bounds, detail) {
      return (
        (detail.column() >= bounds.startCol() && detail.column()  <= bounds.finishCol()) ||
        (detail.column() + detail.colspan() - 1 >= bounds.startCol() && detail.column() + detail.colspan() - 1 <= bounds.finishCol())
      ) && (
        (detail.row() >= bounds.startRow() && detail.row() <= bounds.finishRow()) ||
        (detail.row() + detail.rowspan() - 1 >= bounds.startRow() && detail.row() + detail.rowspan() - 1 <= bounds.finishRow())
      );
    };

    // Note, something is *within* if it is completely contained within the bounds.
    var isWithin = function (bounds, detail) {
      return (
        detail.column() >= bounds.startCol() && 
        (detail.column() + detail.colspan() - 1) <= bounds.finishCol() &&
        detail.row() >= bounds.startRow() &&
        (detail.row() + detail.rowspan() - 1) <= bounds.finishRow()
      );
    };

    var isRectangular = function (warehouse, bounds) {
      var isRect = true;
      var detailIsWithin = Fun.curry(isWithin, bounds);

      
      for (var i = bounds.startRow(); i<=bounds.finishRow(); i++) {
        for (var j = bounds.startCol(); j<=bounds.finishCol(); j++) {
          isRect = isRect && Warehouse.getAt(warehouse, i, j).exists(detailIsWithin);
        }
      }

      return isRect ? Option.some(bounds) : Option.none();
    };
        

    return {
      inSelection: inSelection,
      isWithin: isWithin,
      isRectangular: isRectangular
    };
  }
);