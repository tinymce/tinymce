define(
  'ephox.snooker.test.Fitment',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.Fitment'
  ],

  function (Fun, Fitment) {

    var measureTest = function (expected, startAddress, gridA, gridB) {
      // Try put gridB into gridA at the startAddress
      // returns a delta,
      // colDelta = -3 means gridA is 3 columns too short
      // rowDelta = 3 means gridA can fit gridB with 3 rows to spare

      var tux = Fitment.measure(startAddress, gridA, gridB);
      assert.eq(expected.rowDelta, tux.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ tux.rowDelta());
      assert.eq(expected.colDelta, tux.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ tux.colDelta());
    };

    var tailorTest = function (expected, startAddress, gridA, delta, generator) {
      // Based on the Fitment.measure
      // Increase gridA by the row/col delta values
      // The result is a new grid that will perfectly fit gridB into gridA
      var tux = Fitment.tailor(startAddress, gridA, delta, generator());
      assert.eq(expected, tux);
    };

    var tailorIVTest = function (expected, startAddress, gridA, delta, generator) {
      var tux = Fitment.tailor(startAddress, gridA, delta, generator());
      var rows = tux.length;
      var cols = tux[0].length;
      assert.eq(expected.rows, rows);
      assert.eq(expected.cols, cols);
    };

    var mergeGridsTest = function (expected, startAddress, gridA, gridB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = Fitment.mergeGrid(startAddress, gridA, gridB, generator(), comparator);
      assert.eq(expected, nuGrid);
    };

    var mergeGridsIVTest = function (asserter, startAddress, gridSpecA, gridSpecB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = Fitment.mergeGrid(startAddress, gridSpecA.grid(), gridSpecB.grid(), generator(), comparator);
      asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
    };

    var suite = function (startAddress, gridA, gridB, generator, comparator, expectedMeasure, expectedTailor, expectedMergeGrids) {
      measureTest(expectedMeasure, startAddress, gridA, gridB, Fun.noop);
      tailorTest(expectedTailor, startAddress, gridA, {
        rowDelta: Fun.constant(expectedMeasure.rowDelta),
        colDelta: Fun.constant(expectedMeasure.colDelta)
      }, generator);
      mergeGridsTest(expectedMergeGrids, startAddress, gridA, gridB, generator, comparator);
    };
    return {
      measureTest: measureTest,
      tailorTest: tailorTest,
      tailorIVTest: tailorIVTest,
      mergeGridsTest: mergeGridsTest,
      mergeGridsIVTest: mergeGridsIVTest,
      suite: suite
    };
  }
);