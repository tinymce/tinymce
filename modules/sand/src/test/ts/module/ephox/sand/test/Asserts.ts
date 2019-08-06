import { assert } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';

const assertEq = function (expected: any, actual: any, message: string) {
  try {
    assert.eq(expected, actual);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log('** Error during test: ' + message + ' **\n');
    throw err;
  }
};

export default {
  assertEq
};
