import Arr from 'ephox/katamari/api/Arr';
import ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('IndexOfTest', function() {
  var checkNone = function (xs, x) {
    var actual = Arr.indexOf(xs, x);
    assert.eq(true, actual.isNone());
  };

  var check = function (expected, xs, x) {
    var actual = Arr.indexOf(xs, x).getOrDie('should have value');
    assert.eq(expected, actual);
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
        var index = Arr.indexOf(arr.slice(i), x).getOrDie('should have index');
        return 0 === index;
      });
    }
  );

  Jsc.property(
    'indexOf(unique_arr, val) === some(iterator index)',
    ArbDataTypes.indexArrayOf(10),
    function (arr) {
      return Arr.forall(arr, function (x, i) {
        var index = Arr.indexOf(arr, x).getOrDie('should have index');
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

