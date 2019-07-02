import { UnitTest } from '@ephox/bedrock';
import Jsc from '@ephox/wrap-jsverify';

import * as WrapArrNavigation from 'ephox/alloy/navigation/WrapArrNavigation';

UnitTest.test('WrapArrNavigationTest', () => {
  const genRegularGrid = Jsc.integer(2, 20).generator.flatMap((numRows) => {
    return Jsc.integer(2, 20).generator.flatMap((numCols) => {
      const maxIndex = numRows * numCols;
      return Jsc.integer(0, maxIndex - 1).generator.map((index) => {
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
    });
  });

  const genIrregularGrid = Jsc.integer(2, 3).generator.flatMap((numRows) => {
    return Jsc.integer(2, 3).generator.flatMap((numCols) => {
      return Jsc.integer(1, numCols - 2).generator.flatMap((remainder) => {
        const maxIndex = numRows * numCols + remainder;
        return Jsc.integer(0, maxIndex - 1).generator.map((index) => {

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
      });
    });
  });

  const arbRegularGrid = Jsc.bless({
    generator: genRegularGrid
  });

  const arbIrregularGrid = Jsc.bless({
    generator: genIrregularGrid
  });

  Jsc.property(
    'Regular grid: cycleUp and cycleDown should be symmetric',
    arbRegularGrid,
    (arb) => {
      const afterDown = WrapArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
      const afterUp = WrapArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
      return Jsc.eq(arb.index, afterUp) && afterDown !== arb.index;
    }
  );

  Jsc.property(
    'Regular grid: cycleLeft and cycleRight should be symmetric',
    arbRegularGrid,
    (arb) => {
      const afterLeft = WrapArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
      const afterRight = WrapArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
      return Jsc.eq(arb.index, afterRight) && afterLeft !== arb.index;
    }
  );

  Jsc.property(
    'Irregular grid: cycleUp and cycleDown should be symmetric unless on last row',
    arbIrregularGrid,
    (arb) => {
      const afterDown = WrapArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
      const afterUp = WrapArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
      const usedLastRow = afterDown >= arb.lastRowIndex || afterUp >= arb.lastRowIndex;
      return Jsc.eq(arb.index, afterUp) || usedLastRow;
    }
  );

  Jsc.property(
    'Irregular grid: cycleLeft and cycleRight should be symmetric unless on last row with one remainder',
    arbIrregularGrid,
    (arb) => {
      const afterLeft = WrapArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
      const afterRight = WrapArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
      return Jsc.eq(arb.index, afterRight) || (arb.index >= arb.lastRowIndex && arb.remainder === 1);
    }
  );
});
