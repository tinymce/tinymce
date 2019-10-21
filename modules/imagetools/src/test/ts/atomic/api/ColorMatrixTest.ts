import Assertion from 'ephox/imagetools/test/Assertion';
import * as ColorMatrix from 'ephox/imagetools/transformations/ColorMatrix';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('ColorMatrixTest', function () {
  const checkIdentity = function (label: string, input: ColorMatrix.Matrix) {
    Assertion.assertEq(input, ColorMatrix.identity(), label);
  };

  const checkAdjust = function (label: string, expected: ColorMatrix.Matrix, input: ColorMatrix.Matrix, adjustment: number) {
    const actual = ColorMatrix.adjust(input, adjustment);
    Assertion.assertEq(expected, actual, label);
  };

  const checkMultiply = function (label: string, expected: ColorMatrix.Matrix, input: ColorMatrix.Matrix, matrix: ColorMatrix.Matrix) {
    const actual = ColorMatrix.multiply(input, matrix);
    Assertion.assertEq(expected, actual, label);
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
});
