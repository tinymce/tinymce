import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ObjMapTest', function() {
  var dbl = function (x) {
    return x * 2;
  };

  var addDot = function (x) {
    return x + '.';
  };

  var tupleF = function (x, i) {
    return {
      k: i + 'b',
      v: x + 'b'
    };
  };

  var check = function (expected, input, f) {
    assert.eq(expected, Obj.map(input, f));
  };


  var checkT = function (expected, input, f) {
    assert.eq(expected, Obj.tupleMap(input, f));
  };

  check({}, {}, dbl);
  check({a: 'a.'}, {a: 'a'}, addDot);
  check({a: 'a.', b: 'b.', c: 'c.'}, {a: 'a', b: 'b', c: 'c'}, addDot);

  checkT({}, {}, tupleF);
  checkT({ab:'ab'}, {a:'a'}, tupleF);
  checkT({ab:'ab', bb:'bb', cb:'cb'}, {a:'a', b:'b', c:'c'}, tupleF);

  var stringify = function (x, i) {
    return i + ' :: ' + x;
  };

  var checkMapToArray = function (expected, input, f) {
    assert.eq(expected, Obj.mapToArray(input, f));
  };

  checkMapToArray([], {}, stringify);
  checkMapToArray(['a :: a'], {a:'a'}, stringify);
  checkMapToArray(['a :: a','b :: b','c :: c'], {a:'a', b:'b', c:'c'}, stringify);

  Jsc.property(
    'map id obj = obj',
    Jsc.dict(Jsc.json),
    function (obj) {
      var output = Obj.map(obj, Fun.identity);
      return Jsc.eq(obj, output);
    }
  );

  Jsc.property(
    'map constant obj means that values(obj) are all the constant',
    Jsc.dict(Jsc.json),
    Jsc.json,
    function (obj, x) {
      var output = Obj.map(obj, Fun.constant(x));
      var values = Obj.values(output);
      return Arr.forall(values, function (v) {
        return v === x;
      });
    }
  );

  Jsc.property(
    'tupleMap obj (x, i) -> { k: i, v: x }',
    Jsc.dict(Jsc.json),
    function (obj) {
      var output = Obj.tupleMap(obj, function (x, i) {
        return { k: i, v: x };
      });

      return Jsc.eq(output, obj);
    }
  );

  Jsc.property(
    'mapToArray is symmetric with tupleMap',
    Jsc.dict(Jsc.nestring),
    function (obj) {
      var array = Obj.mapToArray(obj, function (x, i) {
        return { k: i, v: x };
      });

      var aKeys = Arr.map(array, function (x) { return x.k; });
      var aValues = Arr.map(array, function (x) { return x.v; });

      var keys = Obj.keys(obj);
      var values = Obj.values(obj);

      var comp = function (arr1, arr2) {
        return Arr.equal(Arr.sort(arr1), Arr.sort(arr2));
      };

      return comp(keys, aKeys) && comp(values, aValues);
    }
  );
});

