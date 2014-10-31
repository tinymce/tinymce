define(
  'ephox.snooker.picker.CellPosition',

  [
    'ephox.snooker.api.Structs',
    'ephox.sugar.api.Direction',
    'ephox.sugar.api.Element',
    'global!Math'
  ],

  function (Structs, Direction, Element, Math) {
    /*
     * Determine the address(row, column) of a mouse position on the entire document based
     * on position being the (x, y) coordinate of the picker component.
     */
    var findCell = function (position, dimensions, grid, mouse) {
      var doc = Element.fromDom(document.documentElement);
      var calcRtl = position.x() + dimensions.width() - mouse.x();
      var calcLtr =  mouse.x() - position.x();
      var calcDeltaX = Direction.onDirection(calcLtr,calcRtl);

      var deltaX = calcDeltaX(doc);
      var deltaY = mouse.y() - position.y();

      var cellWidth = dimensions.width()/grid.columns();
      var cellHeight = dimensions.height()/grid.rows();

      var col = Math.floor(deltaX/cellWidth);
      var row = Math.floor(deltaY/cellHeight);

      return Structs.address(row, col);
    };

    return {
      findCell: findCell
    };
  }
);