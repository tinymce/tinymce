test(
  'ColorMatrixTest',

  [
    'ephox.imagetools.transformations.ColorMatrix'
  ],

  function (ColorMatrix) {
    var assertEq = function (expected, actual, label) {
      assert.eq(expected, actual, 'test: ' + label + ', expected = ' + expected + ', actual = ' + actual);
    };

    var checkAdjust = function (label, expected, input, adjustment) {
      var actual = ColorMatrix.adjust(input, adjustment);
      assertEq(expected, actual, label);
    };

    checkAdjust('Adjust 1', [
      0.85, 0.15, 0.15, 0.15, 0,
      0.15, 0.85, 0.15, 0.15, 0,
      0.15, 0.15, 0.85, 0.15, 0,
      0.15, 0.15, 0.15, 0.85, 0,
      0.15, 0.15, 0.15, 0.15, 0.7
    ], [
      0.5, 0.5, 0.5, 0.5, 0,
      0.5, 0.5, 0.5, 0.5, 0,
      0.5, 0.5, 0.5, 0.5, 0,
      0.5, 0.5, 0.5, 0.5, 0,
      0.5, 0.5, 0.5, 0.5, 0
    ], 0.3);

  //   QUnit.test('adjust', function() {
  //   var testMatrix = [
  //     0.5, 0.5, 0.5, 0.5, 0,
  //     0.5, 0.5, 0.5, 0.5, 0,
  //     0.5, 0.5, 0.5, 0.5, 0,
  //     0.5, 0.5, 0.5, 0.5, 0,
  //     0.5, 0.5, 0.5, 0.5, 0
  //   ];

  //   QUnit.deepEqual(ColorMatrix.adjust(testMatrix, 0.3), [
  //     0.85, 0.15, 0.15, 0.15, 0,
  //     0.15, 0.85, 0.15, 0.15, 0,
  //     0.15, 0.15, 0.85, 0.15, 0,
  //     0.15, 0.15, 0.15, 0.85, 0,
  //     0.15, 0.15, 0.15, 0.15, 0.7
  //   ]);
  // });
    // assert.eq(1, 2);
  }
);