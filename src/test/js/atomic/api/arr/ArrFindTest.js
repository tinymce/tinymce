import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ArrFindTest', function() {
  var checkNone = function (input, pred) {
    var actual = Arr.find(input, pred);
    assert.eq(true, actual.isNone());
  };

  var checkArr = function (expected, input, pred) {
    var actual = Arr.find(input, pred).getOrDie('should have value');
    assert.eq(expected, actual);
  };

  checkNone([], function (x) { return x > 0; });
  checkNone([-1], function (x) { return x > 0; });
  checkArr(1, [1], function (x) { return x > 0; });
  checkArr(41, [4, 2, 10, 41, 3], function (x) { return x === 41; });
  checkArr(100, [4, 2, 10, 41, 3, 100], function (x) { return x > 80; });
  checkNone([4, 2, 10, 412, 3], function (x) { return x === 41; });

  checkArr(10, [4, 2, 10, 412, 3], function (x, i) { return i === 2; });

  var a = [4, 2, 10, 412, 3];
  checkArr(4, a, function (x, i, o) { return o === a; });


  Jsc.property(
    'the value found by find always passes predicate',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.bool),
    function (arr, pred) {
      var value = Arr.find(arr, pred);
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
      var value = Arr.find(arr, Fun.constant(false));
      return value.isNone();
    }
  );

  Jsc.property(
    'If array is empty, find is always none',
    Jsc.fun(Jsc.bool),
    function (pred) {
      var value = Arr.find([ ], pred);
      return value.isNone();
    }
  );

  Jsc.property(
    'If predicate is always true, then value is always some(first), or none if array is empty',
    Jsc.array(Jsc.json),
    function (arr) {
      var value = Arr.find(arr, Fun.constant(true));
      if (arr.length === 0) return Jsc.eq(true, value.isNone());
      else return Jsc.eq(arr[0], value.getOrDie('should have value'));
    }
  );
});

