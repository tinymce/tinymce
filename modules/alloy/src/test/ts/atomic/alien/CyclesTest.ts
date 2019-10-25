import { UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Cycles from 'ephox/alloy/alien/Cycles';

UnitTest.test('CycleBy should have an adjustment of delta, or be the min or max', () => {

  fc.assert(fc.property(
    fc.nat(),
    fc.integer(),
    fc.nat(),
    fc.nat(),
    (value, delta, min, range) => {
      const max = min + range;
      const actual = Cycles.cycleBy(value, delta, min, max);
      return (actual - value) === delta || actual === min || actual === max;
    }
  ));
});
