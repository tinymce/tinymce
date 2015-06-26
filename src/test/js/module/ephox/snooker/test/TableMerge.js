define(
  'ephox.snooker.test.TableMerge',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.snooker.model.TableMerge',
    'ephox.snooker.test.Fitment'
  ],

  function (Fun, Result, TableMerge, Fitment) {
    var mergeTest = function (expected, startAddress, gridA, gridB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = TableMerge.merge(startAddress, gridA(), gridB(), generator(), comparator);
      nuGrid.fold(function (err) {
        assert.eq(expected.error, err);
      }, function (grid) {
        assert.eq(expected, grid);
      });
    };

    var mergeIVTest = function (asserter, startAddress, gridSpecA, gridSpecB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = TableMerge.merge(startAddress, gridSpecA.grid(), gridSpecB.grid(), generator(), comparator);
      asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
    };

    var suite = function (label, startAddress, gridA, gridB, generator, comparator, expectedMeasure, expectedTailor, expectedMergeGrids) {
      console.log(label);
      Fitment.measureTest(expectedMeasure, startAddress, gridA, gridB, Fun.noop);
      Fitment.tailorTest(expectedTailor, startAddress, gridA, {
        rowDelta: Fun.constant(expectedMeasure.rowDelta),
        colDelta: Fun.constant(expectedMeasure.colDelta)
      }, generator);
      mergeTest(expectedMergeGrids, startAddress, gridA, gridB, generator, comparator);
    };

    return {
      mergeTest: mergeTest,
      mergeIVTest: mergeIVTest,
      suite: suite
    };
  }
);