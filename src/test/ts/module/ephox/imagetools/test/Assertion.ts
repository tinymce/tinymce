import { assert } from '@ephox/bedrock';

var assertEq = function (expected, actual, label) {
  assert.eq(expected, actual, 'test: ' + label + ', expected = ' + expected + ', actual = ' + actual);
  console.log('passed');
};

export default <any> {
  assertEq: assertEq
};