import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';
import * as Zip from 'ephox/katamari/api/Zip';
import { Option } from 'ephox/katamari/api/Option';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Zip', function () {
  const check1 = function (expectedZipToObject: Option<Record<string, string>>, expectedZipToTuples: Option<Array<{ k: string, v: string }>>, keys: string[], values: string[]) {
    const sort = function <T>(a: T[], ord: (a: T, b: T) => -1 | 0 | 1) {
      const c = a.slice();
      c.sort(ord);
      return c;
    };

    const eq = 0;
    const lt = -1;
    const gt = 1;

    const sortTuples = function (a: Array<{k: string, v: string }>) {
      return sort(a, function (a: {k: string, v: string }, b: { k: string, v: string }) {
        return (
          a.k === b.k ? a.v === b.v ? eq
                                    : a.v > b.v ? gt
                                                : lt
                      : a.k > b.k ? gt
                                  : lt
        );
      });
    };

    expectedZipToObject.fold(() => {
      assert.throws(() => Zip.zipToObject(keys, values));
    }, (expected) => {
      assert.eq(expected, Zip.zipToObject(keys, values));
    });
    expectedZipToTuples.fold(() => {
      assert.throws(() => Zip.zipToTuples(keys, values));
    }, (expected) => {
      assert.eq(sortTuples(expected), sortTuples(Zip.zipToTuples(keys, values)));
    });
  };

  check1(
    Option.some({q: 'a', r: 'x'}),
    Option.some([{k: 'q', v: 'a'}, {k: 'r', v: 'x'}]),
    ['q', 'r'],
    ['a', 'x']
  );

  check1(
    Option.some({}),
    Option.some([]),
    [],
    []
  );
  check1(
    Option.none(),
    Option.none(),
    [],
    ['x']
  );
  check1(
    Option.none(),
    Option.none(),
    [],
    ['x', 'y']
  );
  check1(
    Option.none(),
    Option.none(),
    ['q'],
    []
  );
  check1(
    Option.none(),
    Option.none(),
    ['q', 'r'],
    []
  );
  check1(
    Option.none(),
    Option.none(),
    ['q', 'r'],
    ['a']
  );

  Jsc.property(
    'zipToObject has matching keys and values',
    Jsc.array(Jsc.nestring),
    function (rawValues: string[]) {
      const values = Unique.stringArray(rawValues);

      const keys = Arr.map(values, function (v, i) {
        return i;
      });

      const output = Zip.zipToObject(keys, values);

      const oKeys = Obj.keys(output);
      if (oKeys.length !== values.length) {
        return 'Output keys did not match';
      }
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
    function (keys: any[], values: any[]) {
      if (keys.length !== values.length) {
        assert.throws(() => Zip.zipToTuples(keys, values));
        return true;
      } else {
        const output = Zip.zipToTuples(keys, values);
        if (keys.length !== output.length) {
          return 'Output keys did not match';
        }
        return Arr.forall(output, function (x, i) {
          return x.k === keys[i] && x.v === values[i];
        });
      }
    }
  );
});
