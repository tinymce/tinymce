import { assert } from '@ephox/bedrock';

var assertEq = function (expected, actual, message) {
  try {
    assert.eq(expected, actual);
  } catch (err) {
    console.log('** Error during test: ' + message + ' **\n');
    throw err;
  }
};

export default <any> {
  assertEq: assertEq
};