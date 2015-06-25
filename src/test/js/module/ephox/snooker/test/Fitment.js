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

      var tux = Fitment.measure(startAddress, gridA(), gridB());
      assert.eq(true, tux.isValue());
      var result = tux.getOr('out of bounds');
      assert.eq(expected.rowDelta, result.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ result.rowDelta());
      assert.eq(expected.colDelta, result.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ result.colDelta());
    };

    var tailorTest = function (expected, startAddress, gridA, delta, generator) {
      // Based on the Fitment.measure
      // Increase gridA by the row/col delta values
      // The result is a new grid that will perfectly fit gridB into gridA
      Fitment.tailor(startAddress, gridA(), delta, generator()).fold(function (err) {
        assert.eq(expected, err);
      }, function (tailoredGrid) {
        assert.eq(expected, tailoredGrid);
      });
    };

    var tailorIVTest = function (expected, startAddress, gridA, delta, generator) {
      Fitment.tailor(startAddress, gridA(), delta, generator()).fold(function (err) {
        assert.eq(expected, err);
      }, function (tailoredGrid) {
        var rows = tailoredGrid.length;
        var cols = tailoredGrid[0].length;
        assert.eq(expected.rows, rows);
        assert.eq(expected.cols, cols);
      });
    };

    return {
      measureTest: measureTest,
      tailorTest: tailorTest,
      tailorIVTest: tailorIVTest
    };
  }
);