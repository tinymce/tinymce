import { UnitTest } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as WrapArrNavigation from 'ephox/alloy/navigation/WrapArrNavigation';

interface GeneratedGrid {
  readonly values: number[];
  readonly index: number;
  readonly numRows: number;
  readonly numCols: number;
}

interface GeneratedIrregularGrid extends GeneratedGrid {
  readonly lastRowIndex: number;
  readonly remainder: number;
}

UnitTest.test('WrapArrNavigationTest', () => {
  const arbRegularGrid = fc.integer({ min: 2, max: 20 }).chain((numRows) =>
    fc.integer({ min: 2, max: 20 }).chain((numCols) => {
      const maxIndex = numRows * numCols;
      return fc.integer({ min: 0, max: maxIndex - 1 }).map((index): GeneratedGrid => {
        const values = [ ];
        for (let i = 0; i < maxIndex; i++) {
          values[i] = i;
        }

        return {
          values,
          numRows,
          numCols,
          index
        };
      });
    })
  );

  const arbIrregularGrid = fc.integer({ min: 2, max: 3 }).chain((numRows) =>
    fc.integer({ min: 2, max: 3 }).chain((numCols) =>
      fc.integer({ min: 1, max: Math.max(1, numCols - 2) }).chain((remainder) => {
        const maxIndex = numRows * numCols + remainder;
        return fc.integer({ min: 0, max: maxIndex - 1 }).map((index): GeneratedIrregularGrid => {

          const values = [ ];
          for (let i = 0; i < maxIndex; i++) {
            values[i] = i;
          }

          return {
            values,
            numRows: numRows + 1, // due to remainder
            numCols,
            lastRowIndex: numRows * numCols,
            remainder,
            index
          };
        });
      })
    )
  );

  // Regular grid: cycleUp and cycleDown should be symmetric
  fc.assert(fc.property(arbRegularGrid, (arb) => {
    const afterDown = WrapArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
    const afterUp = WrapArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
    assert.equal(afterUp, arb.index);
    assert.notEqual(afterDown, arb.index);
  }));

  // Regular grid: cycleLeft and cycleRight should be symmetric
  fc.assert(fc.property(arbRegularGrid, (arb) => {
    const afterLeft = WrapArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
    const afterRight = WrapArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
    assert.equal(afterRight, arb.index);
    assert.notEqual(afterLeft, arb.index);
  }));

  // Irregular grid: cycleUp and cycleDown should be symmetric unless on last row
  fc.assert(fc.property(arbIrregularGrid, (arb) => {
    const afterDown = WrapArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
    const afterUp = WrapArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
    const usedLastRow = afterDown >= arb.lastRowIndex || afterUp >= arb.lastRowIndex;
    return arb.index === afterUp || usedLastRow;
  }));

  // Irregular grid: cycleLeft and cycleRight should be symmetric unless on last row with one remainder
  fc.assert(fc.property(arbIrregularGrid, (arb) => {
    const afterLeft = WrapArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
    const afterRight = WrapArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
    return arb.index === afterRight || (arb.index >= arb.lastRowIndex && arb.remainder === 1);
  }));
});
