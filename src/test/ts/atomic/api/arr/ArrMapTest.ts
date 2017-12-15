import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Obj from 'ephox/katamari/api/Obj';
import Unique from 'ephox/katamari/api/Unique';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('MapTest', function() {
  var dbl = function (x) {
    return x * 2;
  };

  var check = function (expected, C, input, f) {
    assert.eq(expected, C.map(input, f));
  };

  var checkA = function (expected, input, f) {
    check(expected, Arr, input, f);
  };

  checkA([], [], dbl);
  checkA([2], [1], dbl);
  checkA([4, 6, 10], [2, 3, 5], dbl);

  var checkToObject = function(expected, input, f) {
    assert.eq(expected, Arr.mapToObject(input, f));
  };

  checkToObject({}, [], function() { throw 'boom'; });
  checkToObject({'a': '3a'}, ['a'], function(x) { return 3 + x; });
  checkToObject({'a': '3a', 'b': '3b'}, ['a', 'b'], function(x) { return 3 + x; });
  checkToObject({'1': 4, '2': 5}, [1, 2], function(x) { return 3 + x; });

  Jsc.property(
    'map id xs = xs',
    Jsc.array(Jsc.json),
    function (arr) {
      var output = Arr.map(arr, Fun.identity);
      return Jsc.eq(arr, output);
    }
  );

  Jsc.property(
    'map constant (y) xs = array of y',
    Jsc.array(Jsc.json),
    Jsc.json,
    function (arr, y) {
      var output = Arr.map(arr, Fun.constant(y));
      return Arr.forall(output, function (x) {
        return x === y;
      });
    }
  );

  Jsc.property(
    'mapToObject generates the right number of keys and f(key) = value in object',
    Jsc.array(Jsc.nestring),
    Jsc.fun(Jsc.json),
    function (rawKeys, f) {
      var keys = Unique.stringArray(rawKeys);
      var output = Arr.mapToObject(keys, function (k) { return f(k); });
      var objKeys = Obj.keys(output);
      if (objKeys.length !== keys.length) return 'Not all keys were mapped';

      return Arr.forall(objKeys, function (ok) {
        return Arr.contains(keys, ok) && f(ok) === output[ok];
      });
    }
  );
});

