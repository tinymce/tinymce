test(
  'MatrixNavigationTest',

  [
    'ephox.alloy.navigation.MatrixNavigation',
    'ephox.wrap.Jsc'
  ],

  function (MatrixNavigation, Jsc) {
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
        var postUp = MatrixNavigation.cycleUp(arb.matrix, arb.row, arb.col);
        var postDown = MatrixNavigation.cycleDown(arb.matrix, postUp.row(), postUp.column());
        return Jsc.eq(postDown.row(), arb.row) && Jsc.eq(postDown.column(), arb.col);
      }
    );

    Jsc.property(
      'Regular matrix: cycleLeft and cycleRight should be symmetric',
      arbRegularMatrix,
      function (arb) {
        var postUp = MatrixNavigation.cycleLeft(arb.matrix, arb.row, arb.col);
        var postDown = MatrixNavigation.cycleRight(arb.matrix, postUp.row(), postUp.column());
        return Jsc.eq(postDown.row(), arb.row) && Jsc.eq(postDown.column(), arb.col);
      }
    );

    // Note, irregular matrices require some impressive generator combinators. Not sure how to do it yet.
  }
);