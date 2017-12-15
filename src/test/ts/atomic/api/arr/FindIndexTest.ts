import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('FindIndexTest', function() {
  var checkNone = function (input, pred) {
    var actual = Arr.findIndex(input, pred);
    assert.eq(true, actual.isNone());
  };

  var check = function (expected, input, pred) {
    var actual = Arr.findIndex(input, pred).getOrDie('should have found index: ' + input);
    assert.eq(expected, actual);
  };

  checkNone([], function (x) { return x > 0; });
  checkNone([-1], function (x) { return x > 0; });
  check(0, [1], function (x) { return x > 0; });
  check(3, [4, 2, 10, 41, 3], function (x) { return x == 41; });
  check(5, [4, 2, 10, 41, 3, 100], function (x) { return x > 80; });
  checkNone([4, 2, 10, 412, 3], function (x) { return x == 41; });

  Jsc.property(
    'the index found by findIndex always passes predicate',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.bool),
    function (arr, pred) {
      return Arr.findIndex(arr, pred).fold(function () {
        // nothing in array matches predicate
        return !Arr.exists(arr, pred);
      }, function (index) {
        return pred(arr[index]);
      });
    }
  );

  Jsc.property(
    'If predicate is always false, then index is always none',
    Jsc.array(Jsc.json),
    function (arr) {
      var index = Arr.findIndex(arr, Fun.constant(false));
      return index.isNone();
    }
  );

  Jsc.property(
    'If predicate is always true, then index is always some(0), or none if array is empty',
    Jsc.array(Jsc.json),
    function (arr) {
      var index = Arr.findIndex(arr, Fun.constant(true));
      if (arr.length === 0) return Jsc.eq(true, index.isNone());
      else return Jsc.eq(0, index.getOrDie('should have found index'));
    }
  );
});

