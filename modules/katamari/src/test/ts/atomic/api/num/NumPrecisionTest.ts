import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Num from 'ephox/katamari/api/Num';

describe('atomic.katamari.api.num.NumPrecisionTest', () => {
  it('Num.toPrecision', () => {
    assert.equal(Num.toPrecision(1.003, 2), 1.00);
    assert.equal(Num.toPrecision(2.0006, 3), 2.001);

    fc.assert(fc.property(
      fc.float(),
      fc.nat(5),
      (num, precision) => {
        const diff = 1 / Math.pow(10, precision);
        assert.approximately(Num.toPrecision(num, precision), num, diff);
      }));
  });
});
