import { assert } from '@ephox/bedrock';

const stringify = function (v: any) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return v;
  }
};

const extra = function <T>(expected: T, actual: T) {
  return '.\n  Expected: ' + stringify(expected) + '\n  Actual: ' + stringify(actual);
};

const assertEq = function <T>(label: string, expected: T, actual: T) {
  if (expected !== actual) {
    assert.eq(expected, actual, label + extra(expected, actual));
  }
};

export {
  assertEq
};
