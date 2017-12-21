import WrapArrNavigation from 'ephox/alloy/navigation/WrapArrNavigation';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('WrapArrNavigationTest', function() {
  var genRegularGrid = Jsc.integer(2, 20).generator.flatMap(function (numRows) {
    return Jsc.integer(2, 20).generator.flatMap(function (numCols) {
      var maxIndex = numRows * numCols;
      return Jsc.integer(0, maxIndex - 1).generator.map(function (index) {
        var values = [ ];
        for (var i = 0; i < maxIndex; i++) {
          values[i] = i;
        }

        return {
          values: values,
          numRows: numRows,
          numCols: numCols,
          index: index
        };
      });
    });
  });

  var genIrregularGrid = Jsc.integer(2, 3).generator.flatMap(function (numRows) {
    return Jsc.integer(2, 3).generator.flatMap(function (numCols) {
      return Jsc.integer(1, numCols - 2).generator.flatMap(function (remainder) {
        var maxIndex = numRows * numCols + remainder;
        return Jsc.integer(0, maxIndex - 1).generator.map(function (index) {

          var values = [ ];
          for (var i = 0; i < maxIndex; i++) {
            values[i] = i;
          }

          return {
            values: values,
            numRows: numRows + 1, // due to remainder
            numCols: numCols,
            lastRowIndex: numRows * numCols,
            remainder: remainder,
            index: index
          };
        });
      });
    });
  });

  var arbRegularGrid = Jsc.bless({
    generator: genRegularGrid
  });

  var arbIrregularGrid = Jsc.bless({
    generator: genIrregularGrid
  });

  Jsc.property(
    'Regular grid: cycleUp and cycleDown should be symmetric',
    arbRegularGrid,
    function (arb) {
      var afterDown = WrapArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
      var afterUp = WrapArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
      return Jsc.eq(arb.index, afterUp) && afterDown !== arb.index;
    }
  );

  Jsc.property(
    'Regular grid: cycleLeft and cycleRight should be symmetric',
    arbRegularGrid,
    function (arb) {
      var afterLeft = WrapArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
      var afterRight = WrapArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
      return Jsc.eq(arb.index, afterRight) && afterLeft !== arb.index;
    }
  );

  Jsc.property(
    'Irregular grid: cycleUp and cycleDown should be symmetric unless on last row',
    arbIrregularGrid,
    function (arb) {
      var afterDown = WrapArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
      var afterUp = WrapArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
      var usedLastRow = afterDown >= arb.lastRowIndex || afterUp >= arb.lastRowIndex;
      return Jsc.eq(arb.index, afterUp) || usedLastRow;
    }
  );

  Jsc.property(
    'Irregular grid: cycleLeft and cycleRight should be symmetric unless on last row with one remainder',
    arbIrregularGrid,
    function (arb) {
      var afterLeft = WrapArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
      var afterRight = WrapArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
      return Jsc.eq(arb.index, afterRight) || (arb.index >= arb.lastRowIndex && arb.remainder === 1);
    }
  );
});

