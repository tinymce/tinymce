import { UnitTest } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as MatrixNavigation from 'ephox/alloy/navigation/MatrixNavigation';

interface GeneratedMatrix {
  readonly matrix: string[][];
  readonly row: number;
  readonly col: number;
}

UnitTest.test('MatrixNavigationTest', () => {
  const arbRegularMatrix = fc.integer({ min: 2, max: 3 }).chain((numRows) =>
    // I want to generate for each row, something.
    fc.integer({ min: 2, max: 3 }).chain((numCols) =>
      fc.integer({ min: 0, max: numRows - 1 }).chain((rowIndex) =>
        fc.integer({ min: 0, max: numCols - 1 }).map((colIndex): GeneratedMatrix => {
          const matrix: string[][] = [ ];
          for (let i = 0; i < numRows; i++) {
            const row: string[] = [ ];
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
        })
      )
    )
  );

  // Regular matrix: cycleUp and cycleDown should be symmetric
  fc.assert(fc.property(arbRegularMatrix, (arb) => {
    const postUp = MatrixNavigation.cycleUp(arb.matrix, arb.row, arb.col).getOrDie(
      'Should be able to cycleUp!'
    );
    const postDown = MatrixNavigation.cycleDown(arb.matrix, postUp.rowIndex, postUp.columnIndex).getOrDie(
      'Should be able to cycleDown!'
    );

    assert.equal(postDown.rowIndex, arb.row);
    assert.equal(postDown.columnIndex, arb.col);
  }));

  // Regular matrix: cycleLeft and cycleRight should be symmetric
  fc.assert(fc.property(arbRegularMatrix, (arb) => {
    const postLeft = MatrixNavigation.cycleLeft(arb.matrix, arb.row, arb.col).getOrDie(
      'Should be able to cycleLeft'
    );
    const postRight = MatrixNavigation.cycleRight(arb.matrix, postLeft.rowIndex, postLeft.columnIndex).getOrDie(
      'Should be able to cycleRight'
    );

    assert.equal(postRight.rowIndex, arb.row);
    assert.equal(postRight.columnIndex, arb.col);
  }));

  // Note, irregular matrices require some impressive generator combinators. Not sure how to do it yet.
});
