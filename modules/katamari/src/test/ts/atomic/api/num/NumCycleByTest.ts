import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Num from 'ephox/katamari/api/Num';

describe('atomic.katamari.api.num.NumCycleByTest', () => {

  it(' Unit tests', () => {
    assert.equal(Num.cycleBy(1, 0, 1, 12), 1);
    assert.equal(Num.cycleBy(1, 1, 1, 12), 2);
    assert.equal(Num.cycleBy(1, 2, 1, 12), 3);
    assert.equal(Num.cycleBy(1, 3, 1, 12), 4);
    assert.equal(Num.cycleBy(1, 11, 1, 12), 12);
    assert.equal(Num.cycleBy(1, 12, 1, 12), 1);

    assert.equal(Num.cycleBy(-10, 1, -5, 5), 5);
    assert.equal(Num.cycleBy(-10, 50, -5, 5), -5);

    assert.equal(Num.cycleBy(50, -150, -5, 5), 5);
  });

  it('should have an adjustment of delta, or be the min or max', () => {
    fc.assert(fc.property(
      fc.nat(),
      fc.integer(),
      fc.nat(),
      fc.nat(),
      (value, delta, min, range) => {
        const max = min + range;
        const actual = Num.cycleBy(value, delta, min, max);
        return (actual - value) === delta || actual === min || actual === max;
      }
    ));
  });

  it('0 has no effect', () => {
    fc.assert(fc.property(fc.nat(), fc.nat(), (value, delta) => {
      const actual = Num.cycleBy(value, 0, value, value + delta);
      assert.equal(actual, value);
    }));
  });

  it('delta is max', () => {
    fc.assert(fc.property(fc.nat(), fc.nat(), (value, delta) => {
      const max = value + delta;
      const actual = Num.cycleBy(value, delta, value, max);
      assert.equal(actual, max);
    }));
  });
});
