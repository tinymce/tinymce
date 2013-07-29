test(
  'CellPositionTest',

  [
    'ephox.snooker.picker.CellPosition'
  ],

  function (CellPosition) {


   var check = function (expected, position, size, numCols, numRows, mousePosition) {
    var actual = CellPosition.getPosition(position, size, numCols, numRows, mousePosition);
    assert.eq(expected, actual);
   }

   check({row:0, col:0}, {x:0,y:0}, {width:500, height:500}, 10,10, {x:0,y:0});
   check({row:3, col:3}, {x:0,y:0}, {width:500, height:500}, 10,10, {x:110,y:110});
  }
);
