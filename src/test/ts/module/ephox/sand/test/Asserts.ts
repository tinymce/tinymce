import { assert } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';

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