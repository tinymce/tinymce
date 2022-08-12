import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.arr.ObjValuesTest', () => {
  it('unit test', () => {
    const check = <T>(expValues: T[], input: Record<string, T>) => {
      const c = (expected: T[], v: T[]) => {
        v.sort();
        assert.deepEqual(v, expected);
      };
      c(expValues, Obj.values(input));
    };

    check([], {});
    check([ 'A' ], { a: 'A' });
    check([ 'A', 'B', 'C' ], { a: 'A', c: 'C', b: 'B' });
  });
});
