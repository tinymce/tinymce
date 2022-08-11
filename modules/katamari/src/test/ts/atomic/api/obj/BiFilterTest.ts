import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.BiFilterTest', () => {

  it('unit tests', () => {
    const even = (x: number) => x % 2 === 0;

    const check = <T>(trueObj: Record<string, T>, falseObj: Record<string, T>, input: Record<string, T>, f: (val: T) => boolean) => {
      const filtered = Obj.bifilter(input, f);
      assert.deepEqual(filtered.t, trueObj);
      assert.deepEqual(filtered.f, falseObj);
    };

    check({}, { a: 1 }, { a: 1 }, even);
    check({ b: 2 }, {}, { b: 2 }, even);
    check({ b: 2 }, { a: 1 }, { a: 1, b: 2 }, even);
    check({ b: 2, d: 4 }, { a: 1, c: 3 }, { a: 1, b: 2, c: 3, d: 4 }, even);
  });

  it('Check that if the filter always returns false, then everything is in "f"', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(), fc.string(1, 40)),
      (obj) => {
        const output = Obj.bifilter(obj, Fun.never);
        assert.lengthOf(Obj.keys(output.f), Obj.keys(obj).length);
        assert.lengthOf(Obj.keys(output.t), 0);
        return true;
      }
    ));
  });

  it('Check that if the filter always returns true, then everything is in "t"', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(), fc.string(1, 40)),
      (obj) => {
        const output = Obj.bifilter(obj, Fun.always);
        assert.lengthOf(Obj.keys(output.f), 0);
        assert.lengthOf(Obj.keys(output.t), Obj.keys(obj).length);
        return true;
      }
    ));
  });

  it('Check that everything in f fails predicate and everything in t passes predicate', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(1, 30), fc.integer()),
      (obj) => {
        const predicate = (x: number) => x % 2 === 0;
        const output = Obj.bifilter(obj, predicate);

        const matches = (k: string) => predicate(obj[k]);

        const falseKeys = Obj.keys(output.f);
        const trueKeys = Obj.keys(output.t);

        assert.isFalse(Arr.exists(falseKeys, matches));
        assert.isTrue(Arr.forall(trueKeys, matches));
      }
    ));
  });
});
