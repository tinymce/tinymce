define(
  'ephox.snooker.picker.CellPosition',

  [
  ],

  function () {
    
    var getPosition = function (position, size, numCols, numRows, mousePosition) {
      return {
        row: 0,
        col: 0
      }  
    };


    return {
      getPosition: getPosition
    }

  }
);
