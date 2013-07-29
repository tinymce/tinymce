define(
  'ephox.snooker.picker.CellPosition',

  [
  ],

  function () {
    
    var getPosition = function (tablePosition, tableSize, numCols, numRows, mousePosition) {
      
      var relativeMousePosition = {x:0, y:0};
      relativeMousePosition.x = mousePosition.x - tablePosition.x;
      relativeMousePosition.y = mousePosition.y - tablePosition.y;

      var cellWidth = tableSize.width/numCols;
      var cellHeight = tableSize.height/numRows;

      var col = Math.floor(relativeMousePosition.x/cellWidth);
      var row = Math.floor(relativeMousePosition.y/cellHeight);



      return {
        row: row,
        col: col
      }  

    };


    return {
      getPosition: getPosition
    }

  }
);
