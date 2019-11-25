import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Num from 'ephox/katamari/api/Num';

UnitTest.test('CycleBy: Unit tests', () => {
  Assert.eq('eq', 1, Num.cycleBy(1, 0, 1, 12));
  Assert.eq('eq', 2, Num.cycleBy(1, 1, 1, 12));
  Assert.eq('eq', 3, Num.cycleBy(1, 2, 1, 12));
  Assert.eq('eq', 4, Num.cycleBy(1, 3, 1, 12));
  Assert.eq('eq', 12, Num.cycleBy(1, 11, 1, 12));
  Assert.eq('eq', 1, Num.cycleBy(1, 12, 1, 12));

  Assert.eq('eq', 5, Num.cycleBy(-10, 1, -5, 5));
  Assert.eq('eq', -5, Num.cycleBy(-10, 50, -5, 5));

  Assert.eq('eq', 5, Num.cycleBy(50, -150, -5, 5));
});

UnitTest.test('CycleBy should have an adjustment of delta, or be the min or max', () => {
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

UnitTest.test('CycleBy 0 has no effect', () => {
  fc.assert(fc.property(fc.nat(), fc.nat(), (value, delta) => {
    const actual = Num.cycleBy(value, 0, value, value + delta);
    Assert.eq('eq', value, actual);
  }));
});

UnitTest.test('CycleBy delta is max', () => {
  fc.assert(fc.property(fc.nat(), fc.nat(), (value, delta) => {
    const max = value + delta;
    const actual = Num.cycleBy(value, delta, value, max);
    Assert.eq('eq', max, actual);
  }));
});
