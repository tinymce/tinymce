import { assert } from '@ephox/refute';

var assertEq = function (expected, actual, label) {
  assert.eq(expected, actual, 'test: ' + label + ', expected = ' + expected + ', actual = ' + actual);
  console.log('passed');
};

export default <any> {
  assertEq: assertEq
};