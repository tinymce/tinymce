import * as Cycles from 'ephox/alloy/alien/Cycles';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('CyclesTest', function () {
  Jsc.property(
    'CycleBy should have an adjustment of delta, or be the min or max',
    Jsc.nat,
    Jsc.integer,
    Jsc.nat,
    Jsc.nat,
    function (value, delta, min, range) {
      const max = min + range;
      const actual = Cycles.cycleBy(value, delta, min, max);
      return Jsc.eq((actual - value) === delta, true) || actual === min || actual === max;
    }
  );
});
