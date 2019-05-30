import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ArrFindTest', function() {
  const checkNoneHelper = function (input, pred) {
    const actual = Arr.find(input, pred);
    assert.eq(true, actual.isNone());
  };

  const checkNone = function (input: any[], pred) {
    checkNoneHelper(input, pred);
    checkNoneHelper(Object.freeze(input.slice()), pred);
  };

  const checkArrHelper = function (expected, input, pred) {
    const actual = Arr.find(input, pred).getOrDie('should have value');
    assert.eq(expected, actual);
  };

  const checkArr = function (expected, input, pred) {
    checkArrHelper(expected, input, pred);
    checkArrHelper(expected, Object.freeze(input.slice()), pred);
  };
  checkNone([], function (x) { return x > 0; });
  checkNone([-1], function (x) { return x > 0; });
  checkArr(1, [1], function (x) { return x > 0; });
  checkArr(41, [4, 2, 10, 41, 3], function (x) { return x === 41; });
  checkArr(100, [4, 2, 10, 41, 3, 100], function (x) { return x > 80; });
  checkNone([4, 2, 10, 412, 3], function (x) { return x === 41; });

  checkArr(10, [4, 2, 10, 412, 3], function (x, i) { return i === 2; });

  checkArr(4, [4, 2, 10, 412, 3], function (x, i, o) { 
    return o.length === 5 && o[0] === 4 && o[1] === 2 && o[2] === 10 &&
        o[3] === 412 && o[4] === 3;
  });


  Jsc.property(
    'the value found by find always passes predicate',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.bool),
    function (arr, pred) {
      const value = Arr.find(arr, pred);
      if (value.isNone()) {
        return !Arr.exists(arr, pred);
        // nothing in array matches predicate
      } else {
        return pred(value.getOrDie('should have value'));
      }
    }
  );

  Jsc.property(
    'If predicate is always false, then find is always none',
    Jsc.array(Jsc.json),
    function (arr) {
      const value = Arr.find(arr, Fun.constant(false));
      return value.isNone();
    }
  );

  Jsc.property(
    'If array is empty, find is always none',
    Jsc.fun(Jsc.bool),
    function (pred) {
      const value = Arr.find([ ], pred);
      return value.isNone();
    }
  );

  Jsc.property(
    'If predicate is always true, then value is always some(first), or none if array is empty',
    Jsc.array(Jsc.json),
    function (arr) {
      const value = Arr.find(arr, Fun.constant(true));
      if (arr.length === 0) return Jsc.eq(true, value.isNone());
      else return Jsc.eq(arr[0], value.getOrDie('should have value'));
    }
  );
});

