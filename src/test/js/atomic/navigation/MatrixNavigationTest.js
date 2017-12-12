import MatrixNavigation from 'ephox/alloy/navigation/MatrixNavigation';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/refute';

UnitTest.test('MatrixNavigationTest', function() {
  var genRegularMatrix = Jsc.integer(2, 3).generator.flatMap(function (numRows) {
    // I want to generate for each row, something.
    return Jsc.integer(2, 3).generator.flatMap(function (numCols) {
      return Jsc.integer(0, numRows - 1).generator.flatMap(function (rowIndex) {
        return Jsc.integer(0, numCols - 1).generator.map(function (colIndex) {
          var matrix = [ ];
          for (var i = 0; i < numRows; i++) {
            var row = [ ];
            for (var j = 0; j < numCols; j++) {
              row.push(i + 'x' + j);
            }
            matrix.push(row);
          }

          return {
            matrix: matrix,
            row: rowIndex,
            col: colIndex
          };
        });
      });
    });
  });

  var arbRegularMatrix = Jsc.bless({
    generator: genRegularMatrix
  });

  Jsc.property(
    'Regular matrix: cycleUp and cycleDown should be symmetric',
    arbRegularMatrix,
    function (arb) {
      var postUp = MatrixNavigation.cycleUp(arb.matrix, arb.row, arb.col).getOrDie(
        'Should be able to cycleUp!'
      );
      var postDown = MatrixNavigation.cycleDown(arb.matrix, postUp.rowIndex(), postUp.columnIndex()).getOrDie(
        'Should be able to cycleDown!'
      );
      return Jsc.eq(postDown.rowIndex(), arb.row) && Jsc.eq(postDown.columnIndex(), arb.col);
    }
  );

  Jsc.property(
    'Regular matrix: cycleLeft and cycleRight should be symmetric',
    arbRegularMatrix,
    function (arb) {
      var postLeft = MatrixNavigation.cycleLeft(arb.matrix, arb.row, arb.col).getOrDie(
        'Should be able to cycleLeft'
      );
      var postRight = MatrixNavigation.cycleRight(arb.matrix, postLeft.rowIndex(), postLeft.columnIndex()).getOrDie(
        'Should be able to cycleRight'
      );
      return Jsc.eq(postRight.rowIndex(), arb.row) && Jsc.eq(postRight.columnIndex(), arb.col);
    }
  );

  // Note, irregular matrices require some impressive generator combinators. Not sure how to do it yet.
});

