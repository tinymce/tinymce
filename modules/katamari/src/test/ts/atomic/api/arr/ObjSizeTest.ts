import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.arr.ObjSizeTest', () => {
  it('unit tests', () => {
    const check = (expected: number, input: Record<string, string>) => {
      assert.deepEqual(Obj.size(input), expected);
    };

    check(0, {});
    check(1, { a: 'a' });
    check(3, { a: 'a', b: 'b', c: 'c' });
  });

  it('inductive case', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(1, 30), fc.integer()),
      fc.asciiString(1, 30),
      fc.integer(),
      (obj, k, v) => {
        const objWithoutK = Obj.filter(obj, (x, i) => i !== k);
        assert.deepEqual(Obj.size({ [k]: v, ...objWithoutK }), Obj.size(objWithoutK) + 1);
      }), {
      numRuns: 5000
    });
  });
});
