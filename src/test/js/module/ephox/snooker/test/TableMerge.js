define(
  'ephox.snooker.test.TableMerge',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.TableMerge',
    'ephox.snooker.test.Fitment'
  ],

  function (Fun, TableMerge, Fitment) {
    var mergeTest = function (expected, startAddress, gridA, gridB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = TableMerge.merge(startAddress, gridA, gridB, generator(), comparator);
      assert.eq(expected, nuGrid);
    };

    var mergeIVTest = function (asserter, startAddress, gridSpecA, gridSpecB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = TableMerge.merge(startAddress, gridSpecA.grid(), gridSpecB.grid(), generator(), comparator);
      asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
    };

    var suite = function (startAddress, gridA, gridB, generator, comparator, expectedMeasure, expectedTailor, expectedMergeGrids) {
      Fitment.measureTest(expectedMeasure, startAddress, gridA, gridB, Fun.noop);
      Fitment.tailorTest(expectedTailor, startAddress, gridA, {
        rowDelta: Fun.constant(expectedMeasure.rowDelta),
        colDelta: Fun.constant(expectedMeasure.colDelta)
      }, generator);
      mergeTest(expectedMergeGrids, startAddress, gridA, gridB, generator, comparator);
    };

    var detectSpanTest = function (expected, startAddress, gridA, gridB, _generator, comparator) {
      var nuGrid = TableMerge.detectSpan(startAddress, gridA, gridB, comparator);
      assert.eq(expected, nuGrid);
    };

    return {
      mergeTest: mergeTest,
      mergeIVTest: mergeIVTest,
      suite: suite,
      detectSpanTest: detectSpanTest
    };
  }
);