import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Num from 'ephox/katamari/api/Num';

describe('atomic.katamari.api.num.NumClampTest', () => {
  it('Num.clamp', () => {
    fc.assert(fc.property(
      fc.nat(1000),
      fc.nat(1000),
      fc.nat(1000),
      (a, b, c) => {
        const low = a;
        const med = low + b;
        const high = med + c;
        // low <= med <= high
        assert.equal(Num.clamp(med, low, high), med);
        assert.equal(Num.clamp(med, low, high), med);
        assert.equal(Num.clamp(high, low, med), med);
      }));
  });
});
