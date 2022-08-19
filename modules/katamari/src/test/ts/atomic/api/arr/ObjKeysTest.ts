import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.arr.ObjKeysTest', () => {
  it('unit tests', () => {
    const check = (expKeys: string[], input: Record<string, unknown>) => {
      const c = (expected: string[], v: string[]) => {
        v.sort();
        assert.deepEqual(v, expected);
      };

      c(expKeys, Obj.keys(input));
    };

    check([], {});
    check([ 'a' ], { a: 'A' });
    check([ 'a', 'b', 'c' ], { a: 'A', c: 'C', b: 'B' });
  });

  it('only returns elements that are in the input', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const keys = Obj.keys(obj);
      return Arr.forall(keys, (k) => obj.hasOwnProperty(k));
    }));
  });
});
