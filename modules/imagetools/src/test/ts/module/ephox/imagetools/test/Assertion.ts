import { assert } from '@ephox/bedrock-client';

const assertEq = (expected: any, actual: any, label: string): void => {
  assert.eq(expected, actual, 'test: ' + label + ', expected = ' + expected + ', actual = ' + actual);
  // eslint-disable-next-line no-console
  console.log('passed');
};

export {
  assertEq
};
