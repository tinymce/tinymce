define(
  'ephox.snooker.picker.CellPosition',

  [
    'ephox.snooker.data.Structs',
    'global!Math'
  ],

  function (Structs, Math) {
    /*
     * Determine the address(row, column) of a mouse position on the entire document based
     * on position being the (x, y) coordinate of the picker component.
     */
    var findCell = function (position, dimensions, grid, mouse) {
      var deltaX = mouse.x() - position.x();
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