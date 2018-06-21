import * as Arr from 'ephox/katamari/api/Arr';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('IndexOfTest', function() {
  const checkNoneHelper = function (xs, x) {
    const actual = Arr.indexOf(xs, x);
    assert.eq(true, actual.isNone());
  };

  const checkNone = function (xs: any[], x) {
    checkNoneHelper(xs, x);
    checkNoneHelper(Object.freeze(xs.slice()), x);
  };

  const checkHelper = function (expected, xs, x) {
    const actual = Arr.indexOf(xs, x).getOrDie('should have value');
    assert.eq(expected, actual);
  };

  const check = function (expected, xs: any[], x) {
    checkHelper(expected, xs, x);
    checkHelper(expected, Object.freeze(xs.slice()), x);
  };

  checkNone([], 'x');
  checkNone(['q'], 'x');
  checkNone([1], '1');
  checkNone([1], undefined);
  check(0, [undefined], undefined);
  check(0, [undefined, undefined], undefined);
  check(1, [1, undefined], undefined);
  check(2, ['dog', 3, 'cat'], 'cat');

  // We use this property because duplicates cause problems
  Jsc.property(
    'indexOf(slice, val) == some(0) if slice starts with val',
    Jsc.array(Jsc.json),
    function (arr) {
      return Arr.forall(arr, function (x, i) {
        const index = Arr.indexOf(arr.slice(i), x).getOrDie('should have index');
        return 0 === index;
      });
    }
  );

  Jsc.property(
    'indexOf(unique_arr, val) === some(iterator index)',
    ArbDataTypes.indexArrayOf(10),
    function (arr) {
      return Arr.forall(arr, function (x, i) {
        const index = Arr.indexOf(arr, x).getOrDie('should have index');
        return i === index;
      });
    }
  );

  Jsc.property(
    'indexOf of an empty array is none',
    Jsc.json,
    function (json) {
      return Arr.indexOf([ ], json).isNone();
    }
  );

  Jsc.property(
    'indexOf of a [value].concat(array) is some(0)',
    Jsc.array(Jsc.json),
    Jsc.json,
    function (arr, json) {
      return Arr.indexOf([ json ].concat(arr), json).getOrDie('should have index') === 0;
    }
  );
});

