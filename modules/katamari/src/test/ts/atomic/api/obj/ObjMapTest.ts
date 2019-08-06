import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ObjMapTest', function () {
  const dbl = function (x) {
    return x * 2;
  };

  const addDot = function (x) {
    return x + '.';
  };

  const tupleF = function (x, i) {
    return {
      k: i + 'b',
      v: x + 'b'
    };
  };

  const check = function (expected, input, f) {
    assert.eq(expected, Obj.map(input, f));
  };

  const checkT = function (expected, input, f) {
    assert.eq(expected, Obj.tupleMap(input, f));
  };

  check({}, {}, dbl);
  check({a: 'a.'}, {a: 'a'}, addDot);
  check({a: 'a.', b: 'b.', c: 'c.'}, {a: 'a', b: 'b', c: 'c'}, addDot);

  checkT({}, {}, tupleF);
  checkT({ab: 'ab'}, {a: 'a'}, tupleF);
  checkT({ab: 'ab', bb: 'bb', cb: 'cb'}, {a: 'a', b: 'b', c: 'c'}, tupleF);

  const stringify = function (x, i) {
    return i + ' :: ' + x;
  };

  const checkMapToArray = function (expected, input, f) {
    assert.eq(expected, Obj.mapToArray(input, f));
  };

  checkMapToArray([], {}, stringify);
  checkMapToArray(['a :: a'], {a: 'a'}, stringify);
  checkMapToArray(['a :: a', 'b :: b', 'c :: c'], {a: 'a', b: 'b', c: 'c'}, stringify);

  Jsc.property(
    'map id obj = obj',
    Jsc.dict(Jsc.json),
    function (obj) {
      const output = Obj.map(obj, Fun.identity);
      return Jsc.eq(obj, output);
    }
  );

  Jsc.property(
    'map constant obj means that values(obj) are all the constant',
    Jsc.dict(Jsc.json),
    Jsc.json,
    function (obj, x) {
      const output = Obj.map(obj, Fun.constant(x));
      const values = Obj.values(output);
      return Arr.forall(values, function (v) {
        return v === x;
      });
    }
  );

  Jsc.property(
    'tupleMap obj (x, i) -> { k: i, v: x }',
    Jsc.dict(Jsc.json),
    function (obj) {
      const output = Obj.tupleMap(obj, function (x, i) {
        return { k: i, v: x };
      });

      return Jsc.eq(output, obj);
    }
  );

  Jsc.property(
    'mapToArray is symmetric with tupleMap',
    Jsc.dict(Jsc.nestring),
    function (obj) {
      const array = Obj.mapToArray(obj, function (x, i) {
        return { k: i, v: x };
      });

      const aKeys = Arr.map(array, function (x) { return x.k; });
      const aValues = Arr.map(array, function (x) { return x.v; });

      const keys = Obj.keys(obj);
      const values = Obj.values(obj);

      const comp = function (arr1, arr2) {
        return Arr.equal(Arr.sort(arr1), Arr.sort(arr2));
      };

      return comp(keys, aKeys) && comp(values, aValues);
    }
  );
});
