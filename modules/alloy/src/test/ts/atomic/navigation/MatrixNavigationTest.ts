import * as MatrixNavigation from 'ephox/alloy/navigation/MatrixNavigation';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('MatrixNavigationTest', () => {
  const genRegularMatrix = Jsc.integer(2, 3).generator.flatMap((numRows) => {
    // I want to generate for each row, something.
    return Jsc.integer(2, 3).generator.flatMap((numCols) => {
      return Jsc.integer(0, numRows - 1).generator.flatMap((rowIndex) => {
        return Jsc.integer(0, numCols - 1).generator.map((colIndex) => {
          const matrix = [ ];
          for (let i = 0; i < numRows; i++) {
            const row = [ ];
            for (let j = 0; j < numCols; j++) {
              row.push(i + 'x' + j);
            }
            matrix.push(row);
          }

          return {
            matrix,
            row: rowIndex,
            col: colIndex
          };
        });
      });
    });
  });

  const arbRegularMatrix = Jsc.bless({
    generator: genRegularMatrix
  });

  Jsc.property(
    'Regular matrix: cycleUp and cycleDown should be symmetric',
    arbRegularMatrix,
    (arb) => {
      const postUp = MatrixNavigation.cycleUp(arb.matrix, arb.row, arb.col).getOrDie(
        'Should be able to cycleUp!'
      );
      const postDown = MatrixNavigation.cycleDown(arb.matrix, postUp.rowIndex(), postUp.columnIndex()).getOrDie(
        'Should be able to cycleDown!'
      );
      return Jsc.eq(postDown.rowIndex(), arb.row) && Jsc.eq(postDown.columnIndex(), arb.col);
    }
  );

  Jsc.property(
    'Regular matrix: cycleLeft and cycleRight should be symmetric',
    arbRegularMatrix,
    (arb) => {
      const postLeft = MatrixNavigation.cycleLeft(arb.matrix, arb.row, arb.col).getOrDie(
        'Should be able to cycleLeft'
      );
      const postRight = MatrixNavigation.cycleRight(arb.matrix, postLeft.rowIndex(), postLeft.columnIndex()).getOrDie(
        'Should be able to cycleRight'
      );
      return Jsc.eq(postRight.rowIndex(), arb.row) && Jsc.eq(postRight.columnIndex(), arb.col);
    }
  );

  // Note, irregular matrices require some impressive generator combinators. Not sure how to do it yet.
});
