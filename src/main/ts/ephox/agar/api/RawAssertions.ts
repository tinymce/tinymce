import { assert } from '@ephox/bedrock';
import { JSON as Json } from '@ephox/sand';

var stringify = function (v) {
  try {
    return Json.stringify(v, null, 2);
  } catch (_) {
    return v;
  }
};

var extra = function (expected, actual) {
  return '.\n  Expected: ' + stringify(expected) + '\n  Actual: ' + stringify(actual);
};

var assertEq = function (label, expected, actual) {
  if (expected !== actual) assert.eq(expected, actual, label + extra(expected, actual));
};

export default <any> {
  assertEq: assertEq
};