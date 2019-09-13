import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ArrFindTest', () => {
  const checkNoneHelper = (input, pred) => {
    const actual = Arr.find(input, pred);
    assert.eq(true, actual.isNone());
  };

  const checkNone = (input: any[], pred) => {
    checkNoneHelper(input, pred);
    checkNoneHelper(Object.freeze(input.slice()), pred);
  };

  const checkArrHelper = (expected, input, pred) => {
    const actual = Arr.find(input, pred).getOrDie('should have value');
    assert.eq(expected, actual);
  };

  const checkArr = (expected, input, pred) => {
    checkArrHelper(expected, input, pred);
    checkArrHelper(expected, Object.freeze(input.slice()), pred);
  };
  checkNone([], (x) => x > 0);
  checkNone([-1], (x) => x > 0);
  checkArr(1, [1], (x) => x > 0);
  checkArr(41, [4, 2, 10, 41, 3], (x) => x === 41);
  checkArr(100, [4, 2, 10, 41, 3, 100], (x) => x > 80);
  checkNone([4, 2, 10, 412, 3], (x) => x === 41);

  checkArr(10, [4, 2, 10, 412, 3], (x, i) => i === 2);

  Jsc.property(
    'the value found by find always passes predicate',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.bool),
    (arr, pred) => {
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
    (arr) => {
      const value = Arr.find(arr, Fun.constant(false));
      return value.isNone();
    }
  );

  Jsc.property(
    'If array is empty, find is always none',
    Jsc.fun(Jsc.bool),
    (pred) => {
      const value = Arr.find([ ], pred);
      return value.isNone();
    }
  );

  Jsc.property(
    'If predicate is always true, then value is always some(first), or none if array is empty',
    Jsc.array(Jsc.json),
    (arr) => {
      const value = Arr.find(arr, Fun.constant(true));
      if (arr.length === 0) {
        return Jsc.eq(true, value.isNone());
      } else {
        return Jsc.eq(arr[0], value.getOrDie('should have value'));
      }
    }
  );
});
