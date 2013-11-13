define(
  'ephox.snooker.picker.CellPosition',

  [
    'ephox.snooker.data.Structs',
    'global!Math'
  ],

  function (Structs, Math) {
    
    var findCell = function (position, dimensions, grid, mouse) {
      var delta = Structs.xy(mouse.x() - position.x(), mouse.y() - position.y());

      var cellWidth = dimensions.width()/grid.columns();
      var cellHeight = dimensions.height()/grid.rows();

      var col = Math.floor(delta.x()/cellWidth);
      var row = Math.floor(delta.y()/cellHeight);

      return Structs.cell(row, col);
    };

    return {
      findCell: findCell
    };
  }
);
