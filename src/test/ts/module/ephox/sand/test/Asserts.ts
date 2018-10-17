import { assert } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';

const assertEq = function (expected: any, actual: any, message: string) {
  try {
    assert.eq(expected, actual);
  } catch (err) {
    console.log('** Error during test: ' + message + ' **\n');
    throw err;
  }
};

export default {
  assertEq: assertEq
};