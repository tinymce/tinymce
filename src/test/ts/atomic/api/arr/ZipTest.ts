import Arr from 'ephox/katamari/api/Arr';
import Obj from 'ephox/katamari/api/Obj';
import Unique from 'ephox/katamari/api/Unique';
import Zip from 'ephox/katamari/api/Zip';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('Zip', function() {
  var check1 = function(expectedZipToObject, expectedZipToTuples, keys, values) {
    var sort = function(a, ord) {
      var c = a.slice();
      c.sort(ord);
      return c;
    };

    var eq = 0;
    var lt = -1;
    var gt = 1;

    var sortTuples = function(a) {  
      return sort(a, function(a, b) {
        return (
          a.k === b.k ? a.v === b.v ? eq
                                    : a.v > b.v ? gt
                                                : lt
                      : a.k > b.k ? gt
                                  : lt
        );
      });
    };

    assert.eq(expectedZipToObject, Zip.zipToObject(keys, values));
    assert.eq(sortTuples(expectedZipToTuples), sortTuples(Zip.zipToTuples(keys, values)));
  };

  check1(
    {q: 'a', r: 'x'},
    [{k: 'q', v: 'a'}, {k: 'r', v: 'x'}],
    ['q', 'r'], 
    ['a', 'x']
  );

  check1(
    {},
    [],
    [], 
    []
  );
  check1(
    {},
    [], 
    [],
    ['x']
  );
  check1(
    {},
    [],
    [], 
    ['x', 'y']
  );
  check1(
    {q: undefined},
    [{k: 'q', v: undefined}],
    ['q'], 
    []
  );
  check1(
    {q: undefined, r: undefined},
    [{k: 'q', v: undefined}, {k: 'r', v: undefined}],
    ['q', 'r'], 
    []
  );
  check1(
    {q: 'a', r: undefined},
    [{k: 'q', v: 'a'}, {k: 'r', v: undefined}],
    ['q', 'r'], 
    ['a']
  );

  Jsc.property(
    'zipToObject has matching keys and values',
    Jsc.array(Jsc.nestring),
    function (rawValues) {
      var values = Unique.stringArray(rawValues);

      var keys = Arr.map(values, function (v, i) {
        return i;
      });

      var output = Zip.zipToObject(keys, values);

      var oKeys = Obj.keys(output);
      if (oKeys.length !== values.length) return 'Output keys did not match';
      return Arr.forall(oKeys, function (oKey) {
        var index = parseInt(oKey, 10);
        var expected = values[index];
        return output[oKey] === expected;
      });
    }
  );

  Jsc.property(
    'zipToTuples matches corresponding tuples',
    Jsc.array(Jsc.json),
    Jsc.array(Jsc.json),
    function (keys, values) {
      var output = Zip.zipToTuples(keys, values);

      if (output.length !== keys.length) return 'Output keys did not match';
      return Arr.forall(output, function (x, i) {
        return x.k === keys[i] && x.v === values[i];
      });
    }
  );
});

