import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Unique from 'ephox/katamari/api/Unique';
import * as Zip from 'ephox/katamari/api/Zip';

describe('atomic.katamari.api.arr.ZipTest', () => {
  it('unit tests', () => {
    const check1 = (expectedZipToObject: Optional<Record<string, string>>, expectedZipToTuples: Optional<Array<{ k: string; v: string }>>, keys: string[], values: string[]) => {
      const sort = <T>(a: T[], ord: (a: T, b: T) => -1 | 0 | 1) => {
        const c = a.slice();
        c.sort(ord);
        return c;
      };

      const eq = 0;
      const lt = -1;
      const gt = 1;

      const sortTuples = (a: Array<{ k: string; v: string }>) => sort(a, (a: { k: string; v: string }, b: { k: string; v: string }) => {
        if (a.k === b.k) {
          if (a.v === b.v) {
            return eq;
          } else {
            return a.v > b.v ? gt : lt;
          }
        } else {
          return a.k > b.k ? gt : lt;
        }
      });

      expectedZipToObject.fold(() => {
        assert.throws(() => Zip.zipToObject(keys, values));
      }, (expected) => {
        assert.deepEqual(Zip.zipToObject(keys, values), expected);
      });
      expectedZipToTuples.fold(() => {
        assert.throws(() => Zip.zipToTuples(keys, values));
      }, (expected) => {
        assert.deepEqual(sortTuples(Zip.zipToTuples(keys, values)), sortTuples(expected));
      });
    };

    check1(
      Optional.some({ q: 'a', r: 'x' }),
      Optional.some([{ k: 'q', v: 'a' }, { k: 'r', v: 'x' }]),
      [ 'q', 'r' ],
      [ 'a', 'x' ]
    );

    check1(
      Optional.some({}),
      Optional.some([]),
      [],
      []
    );
    check1(
      Optional.none(),
      Optional.none(),
      [],
      [ 'x' ]
    );
    check1(
      Optional.none(),
      Optional.none(),
      [],
      [ 'x', 'y' ]
    );
    check1(
      Optional.none(),
      Optional.none(),
      [ 'q' ],
      []
    );
    check1(
      Optional.none(),
      Optional.none(),
      [ 'q', 'r' ],
      []
    );
    check1(
      Optional.none(),
      Optional.none(),
      [ 'q', 'r' ],
      [ 'a' ]
    );
  });

  it('returns matching keys and values', () => {
    fc.assert(fc.property(
      fc.array(fc.asciiString(1, 30)),
      (rawValues: string[]) => {
        const values = Unique.stringArray(rawValues);

        const keys = Arr.map(values, (v, i) => i);

        const output = Zip.zipToObject(keys, values);

        const oKeys = Obj.keys(output);
        assert.deepEqual(values.length, oKeys.length);

        assert.deepEqual(Arr.forall(oKeys, (oKey) => {
          const index = parseInt(oKey, 10);
          const expected = values[index];
          return output[oKey] === expected;
        }), true);
      }
    ));
  });

  it('matches corresponding tuples', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.array(fc.integer()),
      (keys, values) => {
        if (keys.length !== values.length) {
          assert.throws(() => Zip.zipToTuples(keys, values));
        } else {
          const output = Zip.zipToTuples(keys, values);
          assert.equal(output.length, keys.length);
          assert.isTrue(Arr.forall(output, (x, i) => x.k === keys[i] && x.v === values[i]));
        }
      }
    ));
  });
});
