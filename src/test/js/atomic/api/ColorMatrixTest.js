test(
  'ColorMatrixTest',

  [
    'ephox.imagetools.transformations.ColorMatrix'
  ],

  function (ColorMatrix) {
    var assertEq = function (expected, actual, label) {
      assert.eq(expected, actual, 'test: ' + label + ', expected = ' + expected + ', actual = ' + actual);
    };

    var checkIdentity = function (label, input) {
      assert.eq(input, ColorMatrix.identity(input), label);
    };

    var checkAdjust = function (label, expected, input, adjustment) {
      var actual = ColorMatrix.adjust(input, adjustment);
      assertEq(expected, actual, label);
    };

    var checkMultiply = function (label, expected, input, matrix) {
      var actual = ColorMatrix.multiply(input, matrix);
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

    checkIdentity('Identity 1', [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);

    checkMultiply('Multiply 1', [
      0.0576, 0.0576, 0.0576, 0.0576, 0,
      0.0576, 0.0576, 0.0576, 0.0576, 0,
      0.0576, 0.0576, 0.0576, 0.0576, 0,
      0.0576, 0.0576, 0.0576, 0.0576, 0,
      0.0576, 0.0576, 0.0576, 0.0576, 0
    ], [
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0
    ], [
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0,
      0.12, 0.12, 0.12, 0.12, 0
    ]);

  }
);