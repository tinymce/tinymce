import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('MapTest', function() {
  const dbl = function (x) {
    return x * 2;
  };

  const check = function (expected, C, input, f) {
    assert.eq(expected, C.map(input, f));
  };

  const checkA = function (expected, input, f) {
    check(expected, Arr, input, f);
    check(expected, Arr, Object.freeze(input.slice()), f);
  };

  checkA([], [], dbl);
  checkA([2], [1], dbl);
  checkA([4, 6, 10], [2, 3, 5], dbl);

  const checkToObject = function(expected, input: any[], f) {
    assert.eq(expected, Arr.mapToObject(input, f));
    assert.eq(expected, Arr.mapToObject(Object.freeze(input.slice()), f));
  };

  checkToObject({}, [], function() { throw 'boom'; });
  checkToObject({'a': '3a'}, ['a'], function(x) { return 3 + x; });
  checkToObject({'a': '3a', 'b': '3b'}, ['a', 'b'], function(x) { return 3 + x; });
  checkToObject({'1': 4, '2': 5}, [1, 2], function(x) { return 3 + x; });

  Jsc.property(
    'map id xs = xs',
    Jsc.array(Jsc.json),
    function (arr) {
      const output = Arr.map(arr, Fun.identity);
      return Jsc.eq(arr, output);
    }
  );

  Jsc.property(
    'map constant (y) xs = array of y',
    Jsc.array(Jsc.json),
    Jsc.json,
    function (arr, y) {
      const output = Arr.map(arr, Fun.constant(y));
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
      const keys = Unique.stringArray(rawKeys);
      const output = Arr.mapToObject(keys, function (k) { return f(k); });
      const objKeys = Obj.keys(output);
      if (objKeys.length !== keys.length) return 'Not all keys were mapped';

      return Arr.forall(objKeys, function (ok) {
        return Arr.contains(keys, ok) && f(ok) === output[ok];
      });
    }
  );
});

