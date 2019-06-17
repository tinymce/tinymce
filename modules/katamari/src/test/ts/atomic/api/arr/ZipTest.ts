import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';
import * as Zip from 'ephox/katamari/api/Zip';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Zip', function() {
  const check1 = function(expectedZipToObject, expectedZipToTuples, keys, values) {
    const sort = function(a, ord) {
      const c = a.slice();
      c.sort(ord);
      return c;
    };

    const eq = 0;
    const lt = -1;
    const gt = 1;

    const sortTuples = function(a) {  
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
      const values = Unique.stringArray(rawValues);

      const keys = Arr.map(values, function (v, i) {
        return i;
      });

      const output = Zip.zipToObject(keys, values);

      const oKeys = Obj.keys(output);
      if (oKeys.length !== values.length) return 'Output keys did not match';
      return Arr.forall(oKeys, function (oKey) {
        const index = parseInt(oKey, 10);
        const expected = values[index];
        return output[oKey] === expected;
      });
    }
  );

  Jsc.property(
    'zipToTuples matches corresponding tuples',
    Jsc.array(Jsc.json),
    Jsc.array(Jsc.json),
    function (keys, values) {
      const output = Zip.zipToTuples(keys, values);

      if (output.length !== keys.length) return 'Output keys did not match';
      return Arr.forall(output, function (x, i) {
        return x.k === keys[i] && x.v === values[i];
      });
    }
  );
});

