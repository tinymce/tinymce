import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';
import * as Zip from 'ephox/katamari/api/Zip';
import { Option } from 'ephox/katamari/api/Option';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Zip: unit tests', () => {
  const check1 = (expectedZipToObject: Option<Record<string, string>>, expectedZipToTuples: Option<Array<{ k: string; v: string }>>, keys: string[], values: string[]) => {
    const sort = <T>(a: T[], ord: (a: T, b: T) => -1 | 0 | 1) => {
      const c = a.slice();
      c.sort(ord);
      return c;
    };

    const eq = 0;
    const lt = -1;
    const gt = 1;

    const sortTuples = (a: Array<{ k: string; v: string }>) => sort(a, (a: { k: string; v: string }, b: { k: string; v: string }) => (
      a.k === b.k ? a.v === b.v ? eq
        : a.v > b.v ? gt
          : lt
        : a.k > b.k ? gt
          : lt
    ));

    expectedZipToObject.fold(() => {
      Assert.throws('boom', () => Zip.zipToObject(keys, values));
    }, (expected) => {
      Assert.eq('eq', expected, Zip.zipToObject(keys, values));
    });
    expectedZipToTuples.fold(() => {
      Assert.throws('boom', () => Zip.zipToTuples(keys, values));
    }, (expected) => {
      Assert.eq('eq', sortTuples(expected), sortTuples(Zip.zipToTuples(keys, values)));
    });
  };

  check1(
    Option.some({ q: 'a', r: 'x' }),
    Option.some([{ k: 'q', v: 'a' }, { k: 'r', v: 'x' }]),
    [ 'q', 'r' ],
    [ 'a', 'x' ]
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
    [ 'x' ]
  );
  check1(
    Option.none(),
    Option.none(),
    [],
    [ 'x', 'y' ]
  );
  check1(
    Option.none(),
    Option.none(),
    [ 'q' ],
    []
  );
  check1(
    Option.none(),
    Option.none(),
    [ 'q', 'r' ],
    []
  );
  check1(
    Option.none(),
    Option.none(),
    [ 'q', 'r' ],
    [ 'a' ]
  );
});

UnitTest.test('zipToObject has matching keys and values', () => {
  fc.assert(fc.property(
    fc.array(fc.asciiString(1, 30)),
    (rawValues: string[]) => {
      const values = Unique.stringArray(rawValues);

      const keys = Arr.map(values, (v, i) => i);

      const output = Zip.zipToObject(keys, values);

      const oKeys = Obj.keys(output);
      Assert.eq('Output keys did not match', oKeys.length, values.length);

      Assert.eq('Output keys', true, Arr.forall(oKeys, (oKey) => {
        const index = parseInt(oKey, 10);
        const expected = values[index];
        return output[oKey] === expected;
      }));
    }
  ));
});

UnitTest.test('zipToTuples matches corresponding tuples', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.array(fc.integer()),
    (keys, values) => {
      if (keys.length !== values.length) {
        Assert.throws('Should throw with different lengths', () => Zip.zipToTuples(keys, values));
      } else {
        const output = Zip.zipToTuples(keys, values);
        Assert.eq('Output keys did not match', keys.length, output.length);
        Assert.eq('', true, Arr.forall(output, (x, i) => x.k === keys[i] && x.v === values[i]));
      }
    }
  ));
});
