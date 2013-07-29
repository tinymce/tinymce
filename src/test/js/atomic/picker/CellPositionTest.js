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
   check({row:2, col:2}, {x:0,y:0}, {width:500, height:500}, 10,10, {x:110,y:110});
   check({row:0, col:2}, {x:0,y:0}, {width:500, height:500}, 10,10, {x:110,y:10});
   check({row:2, col:1}, {x:0,y:0}, {width:300, height:1000}, 5,10, {x:110,y:210});
   check({row:0, col:1}, {x:50,y:180}, {width:300, height:1000}, 5,10, {x:110,y:210});
  }
);
