define(
  'ephox.snooker.test.Fitment',

  [
    'ephox.snooker.model.Fitment'
  ],

  function (Fitment) {

    var measureTest = function (expected, startAddress, gridA, gridB) {
      // Try put gridB into gridA at the startAddress
      // returns a delta,
      // colDelta = -3 means gridA is 3 columns too short
      // rowDelta = 3 means gridA can fit gridB with 3 rows to spare

      Fitment.measure(startAddress, gridA(), gridB()).fold(function (err) {
        assert.eq(expected.error, err);
      }, function (delta) {
        assert.eq(expected.rowDelta, delta.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ delta.rowDelta());
        assert.eq(expected.colDelta, delta.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ delta.colDelta());
      });
    };

    var tailorTest = function (expected, startAddress, gridA, delta, generator) {
      // Based on the Fitment.measure
      // Increase gridA by the row/col delta values
      // The result is a new grid that will perfectly fit gridB into gridA
      var tailoredGrid = Fitment.tailor(startAddress, gridA(), delta, generator());
      assert.eq(expected, tailoredGrid);
    };

    var tailorIVTest = function (expected, startAddress, gridA, delta, generator) {
      var tailoredGrid = Fitment.tailor(startAddress, gridA(), delta, generator());
      var rows = tailoredGrid.length;
      var cols = tailoredGrid[0].length;
      assert.eq(expected.rows, rows);
      assert.eq(expected.cols, cols);
    };

    return {
      measureTest: measureTest,
      tailorTest: tailorTest,
      tailorIVTest: tailorIVTest
    };
  }
);