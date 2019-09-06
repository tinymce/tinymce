import { assert, TestLabel } from '@ephox/bedrock';

const stringify = function (v: any): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return v;
  }
};

const extra = function <T>(expected: T, actual: T): string {
  return '.\n  Expected: ' + stringify(expected) + '\n  Actual: ' + stringify(actual);
};

const assertEq = function <T>(label: TestLabel, expected: T, actual: T) {
  assert.eq(expected, actual, TestLabel.concat(label, () => extra(expected, actual)));
};

export {
  assertEq
};
