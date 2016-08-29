define(
  'ephox.alloy.navigation.MatrixNavigation',

  [
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.scullion.Struct',
    'global!Math'
  ],

  function (ArrNavigation, Struct, Math) {
    // TODO: Atomic tests.
    var address = Struct.immutableBag([ 'row', 'column' ], [ ]);

    var cycleHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
      var row = matrix[rowIndex];
      var colsInRow = row.length;
      var newColIndex = ArrNavigation.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
      return address({
        row: rowIndex,
        column: newColIndex
      });
    };

    var cycleVertical = function (matrix, colIndex, startRow, deltaRow) {
      var nextRowIndex = ArrNavigation.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
      var colsInNextRow = matrix[nextRowIndex].length;
      return address({
        row: nextRowIndex,
        column: ArrNavigation.cap(colIndex, 0, colsInNextRow - 1)
      });
    };

    // return address(Math.floor(index / columns), index % columns);
    var cycleRight = function (matrix, startRow, startCol) {
      return cycleHorizontal(matrix, startRow, startCol, +1);
    };

    var cycleLeft = function (matrix, startRow, startCol) {
      return cycleHorizontal(matrix, startRow, startCol, -1);
    };

    var cycleUp = function (matrix, startRow, startCol) {
      return cycleVertical(matrix, startCol, startRow, -1);
    };

    var cycleDown = function (matrix, startRow, startCol) {
      return cycleVertical(matrix, startCol, startRow, +1);
    };

    return {
      cycleRight: cycleRight,
      cycleLeft: cycleLeft,
      cycleUp: cycleUp,
      cycleDown: cycleDown
    };
  }
);