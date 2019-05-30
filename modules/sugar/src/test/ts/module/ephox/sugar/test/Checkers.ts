import { assert } from '@ephox/bedrock';
import { Arr, Fun } from '@ephox/katamari';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Node from 'ephox/sugar/api/node/Node';

const expectedSome = Fun.curry(assert.fail, 'Expected actual to be some, was none');

const checkOpt = function (expected, actual) {
  expected.fold(function () {
    assert.eq(true, actual.isNone(), 'Expected actual to be none, was some');
  }, function (v) {
    actual.fold(expectedSome, function (vv) {
      assert.eq(true, Compare.eq(v, vv));
    });
  });
};

const checkList = function (expected, actual) {
  assert.eq(expected.length, actual.length);
  Arr.each(expected, function (x, i) {
    assert.eq(true, Compare.eq(expected[i], actual[i]));
  });
};

const isName = function (name) {
  return function (x) {
    return Node.name(x) === name;
  };
};

export default {
  checkOpt,
  checkList,
  isName,
};