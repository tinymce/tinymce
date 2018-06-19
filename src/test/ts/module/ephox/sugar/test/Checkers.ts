import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Compare from 'ephox/sugar/api/dom/Compare';
import Node from 'ephox/sugar/api/node/Node';
import { assert } from '@ephox/bedrock';

var expectedSome = Fun.curry(assert.fail, 'Expected actual to be some, was none');

var checkOpt = function (expected, actual) {
  expected.fold(function () {
    assert.eq(true, actual.isNone(), 'Expected actual to be none, was some');
  }, function (v) {
    actual.fold(expectedSome, function (vv) {
      assert.eq(true, Compare.eq(v, vv));
    });
  });
};

var checkList = function (expected, actual) {
  assert.eq(expected.length, actual.length);
  Arr.each(expected, function (x, i) {
    assert.eq(true, Compare.eq(expected[i], actual[i]));
  });
};

var isName = function (name) {
  return function (x) {
    return Node.name(x) === name;
  };
};

export default {
  checkOpt,
  checkList,
  isName,
};